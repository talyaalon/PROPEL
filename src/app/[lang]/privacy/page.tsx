import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locales, isLocale } from '@/lib/i18n'
import { siteConfig } from '@/lib/config'
import { privacyPolicy } from '@/content/legal'
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

  const doc = privacyPolicy[lang]

  return {
    title: doc.title,
    description: doc.intro,
    alternates: {
      canonical: `${siteConfig.url}/${lang}/privacy`,
      languages: {
        he: `${siteConfig.url}/he/privacy`,
        en: `${siteConfig.url}/en/privacy`,
        'x-default': `${siteConfig.url}/he/privacy`,
      },
    },
  }
}

export default async function PrivacyPage({ params }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  return <LegalPage lang={lang} doc={privacyPolicy[lang]} />
}
