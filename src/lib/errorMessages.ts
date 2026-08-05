import type { Locale } from './i18n'

/**
 * Copy for the 404 and error boundaries.
 *
 * Deliberately kept out of the JSON dictionaries: `error.tsx` is a client
 * error boundary that ships with every route's bundle, and importing the full
 * dictionary there would add it to the initial payload of every page.
 */

type ErrorCopy = {
  title: string
  body: string
  cta: string
}

export const notFoundCopy: Record<Locale, ErrorCopy> = {
  he: {
    title: 'הדף הזה לא קיים',
    body: 'יכול להיות שהכתובת השתנתה, או שהקישור שהגעתם ממנו כבר לא מעודכן.',
    cta: 'חזרה לדף הבית',
  },
  en: {
    title: "This page doesn't exist",
    body: 'The address may have changed, or the link you followed is out of date.',
    cta: 'Back to homepage',
  },
}

export const errorCopy: Record<Locale, ErrorCopy> = {
  he: {
    title: 'משהו השתבש',
    body: 'נתקלנו בתקלה בטעינת הדף. אפשר לנסות שוב, ואם זה חוזר - נשמח לשמוע.',
    cta: 'נסו שוב',
  },
  en: {
    title: 'Something went wrong',
    body: "We hit a problem loading this page. Try again - and if it keeps happening, we'd like to know.",
    cta: 'Try again',
  },
}

/** Reads the locale out of a pathname. Used by the error boundaries, which receive no params. */
export function localeFromPathname(pathname: string): Locale {
  return pathname.startsWith('/en') ? 'en' : 'he'
}
