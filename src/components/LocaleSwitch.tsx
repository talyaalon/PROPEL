'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getAltLocale, swapLocaleInPath, type Locale } from '@/lib/i18n'

type Props = {
  lang: Locale
  /** The visible token - "EN" / "HE". */
  label: string
  /** The full phrase - "Switch to English" / "מעבר לעברית". */
  switchLabel?: string
  onClick?: () => void
  className?: string
}

/**
 * THE language switcher - header, drawer and footer all render this one.
 *
 * It existed alongside two inline copies of the same logic in Navigation, and
 * they had already drifted: the copies fixed 2.5.3 Label in Name while this
 * one had no accessible name at all, and this one had no `lang` while the
 * copies did. Three implementations of one control is how that happens; the
 * differences live here now, once.
 *
 * The details that are each here for a reason:
 *
 *  - `swapLocaleInPath` keeps the visitor on the page they are reading.
 *    Linking to `/${altLang}` dropped them on the homepage - from a case
 *    study, a silent dead end.
 *  - The accessible name leads with the visible token (2.5.3 Label in Name):
 *    a speech-input user says "click HE", and a name that is only the other
 *    language's phrase shares no word with that.
 *  - `lang` marks the link's text as being in the other language (3.1.2
 *    Language of Parts), so a screen reader switches voice for it.
 *  - `prefetch={false}`: the other locale's page is a rare navigation, not
 *    one worth a speculative fetch from every page view.
 */
export default function LocaleSwitch({ lang, label, switchLabel, onClick, className }: Props) {
  const pathname = usePathname()
  const altLang = getAltLocale(lang)

  return (
    <Link
      href={swapLocaleInPath(pathname, altLang)}
      hrefLang={altLang}
      lang={altLang}
      prefetch={false}
      aria-label={switchLabel ? `${label} - ${switchLabel}` : undefined}
      onClick={onClick}
      className={className}
    >
      {label}
    </Link>
  )
}
