import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locales, isLocale } from '@/lib/i18n'
import { siteConfig } from '@/lib/config'
import { pageMetadata } from '@/lib/pageMetadata'
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

  return pageMetadata({
    lang,
    path: 'accessibility',
    title: doc.title,
    description: doc.intro,
  })
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
          ? {
              /*
               * "Accessibility enquiries", not "Accessibility coordinator".
               *
               * The Israeli regulations require a service provider to appoint a
               * named coordinator above a headcount threshold; a one-person
               * agency is below it. The heading said a coordinator existed and
               * then listed a phone number and an email under no name, which is
               * a claim the site cannot support. This says what is actually
               * true: here is where accessibility enquiries go.
               */
              heading: isHe ? 'פניות בנושא נגישות' : 'Accessibility enquiries',
              lines,
            }
          : undefined
      }
    />
  )
}
