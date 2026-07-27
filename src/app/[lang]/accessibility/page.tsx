import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locales, isLocale } from '@/lib/i18n'
import { siteConfig } from '@/lib/config'
import { accessibilityStatement } from '@/content/legal'
import LegalPage from '@/components/LegalPage'

type Props = {
  params: Promise<{ lang: string }>
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}

  const doc = accessibilityStatement[lang]

  return {
    title: doc.title,
    description: doc.intro,
    alternates: {
      canonical: `${siteConfig.url}/${lang}/accessibility`,
      languages: {
        he: `${siteConfig.url}/he/accessibility`,
        en: `${siteConfig.url}/en/accessibility`,
        'x-default': `${siteConfig.url}/he/accessibility`,
      },
    },
  }
}

export default async function AccessibilityPage({ params }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const isHe = lang === 'he'

  // The regulations require a named coordinator and a way to reach them.
  const lines = [
    siteConfig.a11yContactName &&
      `${isHe ? 'רכז נגישות' : 'Accessibility coordinator'}: ${siteConfig.a11yContactName}`,
    siteConfig.phoneDisplay && `${isHe ? 'טלפון' : 'Phone'}: ${siteConfig.phoneDisplay}`,
    siteConfig.email && `${isHe ? 'אימייל' : 'Email'}: ${siteConfig.email}`,
  ].filter((line): line is string => Boolean(line))

  return (
    <LegalPage
      lang={lang}
      doc={accessibilityStatement[lang]}
      contactBlock={
        lines.length > 0
          ? { heading: isHe ? 'פרטי רכז הנגישות' : 'Accessibility coordinator', lines }
          : undefined
      }
    />
  )
}
