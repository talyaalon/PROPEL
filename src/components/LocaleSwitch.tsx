'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getAltLocale, swapLocaleInPath, type Locale } from '@/lib/i18n'

type Props = {
  lang: Locale
  label: string
  className?: string
}

/**
 * Language switcher that keeps the visitor on the page they are reading.
 * Linking straight to `/${altLang}` drops them back on the homepage — from a
 * case study that is a silent dead end.
 */
export default function LocaleSwitch({ lang, label, className }: Props) {
  const pathname = usePathname()
  const altLang = getAltLocale(lang)

  return (
    <Link href={swapLocaleInPath(pathname, altLang)} hrefLang={altLang} className={className}>
      {label}
    </Link>
  )
}
