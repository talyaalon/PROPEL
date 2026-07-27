import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['he', 'en'] as const
export type Locale = (typeof locales)[number]
const defaultLocale: Locale = 'he'

function getLocaleFromPath(pathname: string): Locale | null {
  for (const locale of locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale
    }
  }
  return null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const locale = getLocaleFromPath(pathname)

  if (!locale) {
    const url = request.nextUrl.clone()
    url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`
    return NextResponse.redirect(url)
  }

  const response = NextResponse.next()
  response.headers.set('x-locale', locale)
  return response
}

export const config = {
  // Exclude: Next.js internals, static files, AND /studio (Sanity Admin)
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|studio|.*\\..*).*)'],
}
