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
 * Set on the rewritten 404 response, read by the Netlify edge function that
 * upgrades its status to 404.
 *
 * Three ways of getting a real 404 status out of this route were built and
 * measured before this one, and each failed differently:
 *
 *  - `[[redirects]]` with `status = 404` in netlify.toml. Never fired: the
 *    Next runtime claims the path before Netlify consults the redirect table.
 *  - `notFound()` from the catch-all page. Returns a genuine 404, but Next
 *    renders `not-found.tsx` OUTSIDE `[lang]/layout.tsx` - measured as
 *    `<html>` with no `lang`, no `dir`, no stylesheet, no navigation and no
 *    footer. That is 3.1.1 Language of Page at Level A, traded for a status
 *    code.
 *  - Fetching the prerendered `/he/404` from inside the middleware and
 *    returning its body with a 404 status. Next answers a middleware's
 *    self-fetch with a 5.5KB client shell rather than the rendered page;
 *    measured at 5,573 bytes against the 51,174 the same URL serves directly.
 *
 * So the page keeps its own rendering path, which is the one that works, and
 * the status is corrected at the edge - the one layer that runs before the
 * Next handler and can still see the response on its way out.
 *
 * Locally (`next start`) there is no edge function, so an unknown path answers
 * 200 with this header present. That is the same soft 404 the site served
 * before, and it carries `noindex` either way.
 */
export const NOT_FOUND_MARKER = 'x-propel-notfound'

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const locale = getLocaleFromPath(pathname)

  if (!locale) {
    const preferred = getPreferredLocale(request)
    const url = request.nextUrl.clone()
    url.pathname = `/${preferred}${pathname === '/' ? '' : pathname}`
    return NextResponse.redirect(url)
  }

  /*
   * Unmatched paths under a locale, rewritten to that locale's 404 page.
   *
   * Without this they fell through to Next's own built-in error page, which
   * lives outside every layout in this project - so a Hebrew visitor following
   * a stale link got an English page with no `lang` and no `dir`, no
   * stylesheet, no navigation and no accessibility menu. That is 3.1.1
   * Language of Page at Level A.
   *
   * It has to happen here rather than in a catch-all route. `[lang]/layout.tsx`
   * sets `dynamicParams = false` so that only the two real locales are ever
   * built, and that gates the whole subtree: a catch-all page never runs,
   * whatever it sets for itself. Middleware is upstream of routing, so it is
   * the only place that can see the request at all.
   *
   * A rewrite keeps the URL the visitor typed and serves a prerendered page, so
   * this responds 200 rather than 404. The page carries `noindex`, which is the
   * part that would otherwise matter. Getting a real 404 status would mean
   * moving `<html>` above the locale segment, and that means serving every
   * English page as `lang="he"` - far worse than a soft 404 on a page nobody
   * should reach.
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
  if (!knownPaths().has(rest)) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/404`
    /*
     * The rewrite serves the localised, fully-styled 404 page. The marker
     * header is what turns the 200 into a real 404, in
     * `netlify/edge-functions/not-found-status.ts` - see the note below the
     * `NOT_FOUND_MARKER` constant.
     */
    const response = NextResponse.rewrite(url)
    response.headers.set(NOT_FOUND_MARKER, '1')
    response.headers.set('x-robots-tag', 'noindex')
    return response
  }

  return NextResponse.next()
}

export const config = {
  // Exclude Next.js internals, metadata routes, and anything with a file extension
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|icon|apple-icon|opengraph-image|robots\\.txt|sitemap\\.xml|.*\\..*).*)',
  ],
}
