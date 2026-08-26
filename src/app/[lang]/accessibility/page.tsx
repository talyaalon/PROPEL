import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locales, isLocale } from '@/lib/i18n'
import { siteConfig } from '@/lib/config'
import { pageMetadata } from '@/lib/pageMetadata'
import { accessibilityStatement } from '@/content/legal'
import LegalPage, { type LegalContactLine } from '@/components/LegalPage'

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

  // The regulations require a way to reach someone about accessibility, and
  // every channel here is actionable: this page's reader may be the one person
  // on the site who cannot comfortably retype a phone number.
  const candidates: (LegalContactLine | null)[] = [
    siteConfig.a11yContactName
      ? {
          label: isHe ? 'רכז נגישות' : 'Accessibility coordinator',
          value: siteConfig.a11yContactName,
        }
      : null,
    siteConfig.phoneDisplay
      ? {
          label: isHe ? 'טלפון' : 'Phone',
          value: siteConfig.phoneDisplay,
          href: `tel:${siteConfig.phoneDial}`,
          dir: 'ltr' as const,
        }
      : null,
    siteConfig.email
      ? {
          label: isHe ? 'אימייל' : 'Email',
          value: siteConfig.email,
          href: `mailto:${siteConfig.email}`,
          dir: 'ltr' as const,
        }
      : null,
    /*
     * The form, always. The other two rows are phone and WhatsApp - both
     * require a phone call - and this is the page a visitor reaches BECAUSE
     * something already blocked them. Someone who cannot use a phone was
     * being offered no channel at all, while a fully labelled form sat one
     * link away.
     */
    {
      label: isHe ? 'טופס' : 'Form',
      value: isHe ? 'טופס יצירת קשר באתר' : 'Contact form on the site',
      href: `/${lang}#contact`,
    },
  ]
  const lines = candidates.filter((line): line is LegalContactLine => line !== null)

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
