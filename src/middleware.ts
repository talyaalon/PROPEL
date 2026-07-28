import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// Must live inside `src/` — Next only picks middleware up from the directory
// that contains the `app` folder. At the project root it is silently ignored.
import { locales, defaultLocale, type Locale } from './lib/i18n'

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (getLocaleFromPath(pathname)) return NextResponse.next()

  const locale = getPreferredLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  // Exclude Next.js internals, metadata routes, and anything with a file extension
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|icon|apple-icon|opengraph-image|robots\\.txt|sitemap\\.xml|.*\\..*).*)',
  ],
}
