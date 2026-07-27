import type { Locale } from './i18n'

const dictionaries = {
  he: () => import('@/dictionaries/he.json').then((m) => m.default),
  en: () => import('@/dictionaries/en.json').then((m) => m.default),
}

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]()
}
