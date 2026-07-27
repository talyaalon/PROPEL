// Single source of truth for locales. Imported by the middleware, the layout,
// and every component that needs to reason about direction or the alternate language.

export const locales = ['he', 'en'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'he'

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

export function getDirection(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'he' ? 'rtl' : 'ltr'
}

export function getAltLocale(locale: Locale): Locale {
  return locale === 'he' ? 'en' : 'he'
}

/**
 * Swaps the locale segment of a pathname, keeping the rest of the route intact.
 * `/he/portfolio/acme` + `en` → `/en/portfolio/acme`
 *
 * Without this the language switcher drops the visitor back on the homepage.
 */
export function swapLocaleInPath(pathname: string, target: Locale): string {
  const segments = pathname.split('/')
  // segments[0] is always '' because pathnames start with '/'
  if (segments.length > 1 && isLocale(segments[1])) {
    segments[1] = target
    return segments.join('/')
  }
  return `/${target}${pathname === '/' ? '' : pathname}`
}
