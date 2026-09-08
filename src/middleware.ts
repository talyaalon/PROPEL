import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// Must live inside `src/` - Next only picks middleware up from the directory
// that contains the `app` folder. At the project root it is silently ignored.
import { locales, defaultLocale, type Locale } from './lib/i18n'
import { sitePaths } from './lib/routes'

function getLocaleFromPath(pathname: string): Locale | null {
  for (const locale of locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale
    }
  }
  return null
}

/** Picks a locale from the browser's Accept-Language header, defaulting to Hebrew. */
function getPreferredLocale(request: NextRequest): Locale {
  const header = request.headers.get('accept-language')
  if (!header) return defaultLocale

  // 'en-US,en;q=0.9,he;q=0.8' → ['en-us', 'en', 'he']
  const tags = header.split(',').map((part) => part.split(';')[0].trim().toLowerCase())

  for (const tag of tags) {
    const base = tag.split('-')[0]
    const match = locales.find((locale) => locale === base)
    if (match) return match
  }

  return defaultLocale
}

/**
 * Every path the site actually answers, after the locale prefix.
 *
 * `sitePaths()` IS the sitemap's list - one module, two consumers - so a page
 * cannot be crawlable and 404 at the same time.
 */
function knownPaths(): Set<string> {
  return new Set(sitePaths())
}

/**
 * Next's generated metadata routes, which live under the locale segment and
 * are not pages.
 *
 * `src/app/[lang]/opengraph-image.tsx` is served at `/he/opengraph-image`.
 * The config matcher below excludes `opengraph-image` only at the START of a
 * path, so the locale-prefixed one fell straight through to the unknown-path
 * rewrite: every og:image and twitter:image on all 36 URLs returned 48KB of
 * 404 HTML with `Content-Type: text/html` instead of a PNG. Every share card
 * on the site was broken, silently, because nothing renders an og:image on
 * the page itself.
 *
 * Listed as a family rather than one string so adding `twitter-image.tsx`
 * later does not reintroduce it.
 */
const METADATA_ROUTES = new Set([
  '/opengraph-image',
  '/twitter-image',
  '/icon',
  '/apple-icon',
])

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const locale = getLocaleFromPath(pathname)

  if (!locale) {
    const preferred = getPreferredLocale(request)
    const url = request.nextUrl.clone()
    url.pathname = `/${preferred}${pathname === '/' ? '' : pathname}`
    return NextResponse.redirect(url)
  }

  /*
   * Unmatched paths under a locale answer that locale's 404 page with a real
   * 404 status. `notFoundResponse` below says how, and lists the five ways
   * that did not work.
   *
   * It has to happen here rather than in a catch-all route. `[lang]/layout.tsx`
   * sets `dynamicParams = false` so that only the two real locales are ever
   * built, and that gates the whole subtree: a catch-all page never runs on
   * demand, whatever it sets for itself. Middleware is upstream of routing, so
   * it is the only place that can see the request at all.
   */
  const rest = pathname.slice(`/${locale}`.length).replace(/\/$/, '')
  if (METADATA_ROUTES.has(rest)) return NextResponse.next()
  /*
   * Nested metadata: /he/blog/<slug>/opengraph-image and friends. The leaf is
   * one of the metadata routes and the parent must be a page that exists -
   * without the second check this would exempt /he/anything/opengraph-image
   * from the 404 rewrite. Added for the per-article link-preview cards; the
   * root-level check above stays untouched because the postbuild guard parses
   * it by shape.
   */
  const cut = rest.lastIndexOf('/')
  if (cut > 0 && METADATA_ROUTES.has(rest.slice(cut)) && knownPaths().has(rest.slice(0, cut))) {
    return NextResponse.next()
  }
  if (!knownPaths().has(rest)) return notFoundResponse(request, locale)

  return NextResponse.next()
}

/**
 * The localised 404 page, sent with a 404 status.
 *
 * `/{locale}/page-not-found` is prerendered inside the locale layout, so it
 * has `lang`, `dir`, the stylesheet, the navigation and the footer. This
 * fetches it from the same deployment and re-sends the HTML under the URL the
 * visitor typed, with the status the page cannot set for itself.
 *
 * Why a fetch, when a rewrite is one line. Five ways of getting a genuine 404
 * out of this route were built and measured before this one:
 *
 *  - `[[redirects]]` with `status = 404` in netlify.toml. Never fired: the
 *    Next runtime claims the path before Netlify consults the table.
 *  - `notFound()` from the catch-all page. A 404, but Next renders
 *    `not-found.tsx` OUTSIDE `[lang]/layout.tsx` - no lang, no dir, no
 *    stylesheet, no navigation. Measured with `dynamicParams` both ways and
 *    from inside a route group; the bare shell never changes. WCAG 3.1.1 at
 *    Level A, traded for a status code.
 *  - A Netlify edge function re-sending a marked response with a 404.
 *    Deployed, and measured on production doing nothing: the framework's own
 *    middleware edge function runs first and its rewrite ends the chain.
 *  - `NextResponse.rewrite(url, { status: 404 })`. Correct under `next start`,
 *    and the obvious answer. On Netlify the runtime serves the rewrite TARGET
 *    from its cache with the target's own 200 and drops the status option -
 *    measured on production as `Cache-Status: hit` on a path that had never
 *    been requested before.
 *  - A route handler under `[lang]` returning the page with a 404. The
 *    layout's `dynamicParams = false` makes the segment static-only, and a
 *    dynamic handler under it fails at request time (DYNAMIC_SERVER_USAGE).
 *
 * A response the middleware builds itself is the one thing no layer can
 * reinterpret: it is not a rewrite, so there is no target to cache and no
 * status to replace. The fetched path is in `sitePaths()`, so the inner
 * request passes straight through this middleware instead of recursing into
 * it.
 *
 * If the fetch fails for any reason the fallback is the previous behaviour, a
 * rewrite to the same page: 200 with `noindex`, nothing worse than it was.
 * `x-propel-404` says which branch answered, so a production measurement can
 * tell them apart without reading the body.
 */
async function notFoundResponse(request: NextRequest, locale: Locale): Promise<NextResponse> {
  const page = new URL(`/${locale}/page-not-found`, request.url)
  try {
    const upstream = await fetch(page, { headers: { accept: 'text/html' } })
    if (upstream.ok) {
      return new NextResponse(await upstream.text(), {
        status: 404,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          // A 404 is heuristically cacheable. Say no, so a page created later
          // is not served out of a browser cache as still missing.
          'cache-control': 'no-cache',
          'x-robots-tag': 'noindex',
          'x-propel-404': 'page',
        },
      })
    }
  } catch {
    // Fall through to the soft 404.
  }
  const response = NextResponse.rewrite(page)
  response.headers.set('x-robots-tag', 'noindex')
  response.headers.set('x-propel-404', 'rewrite')
  return response
}

export const config = {
  // Exclude Next.js internals, metadata routes, and anything with a file extension
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|icon|apple-icon|opengraph-image|robots\\.txt|sitemap\\.xml|.*\\..*).*)',
  ],
}
