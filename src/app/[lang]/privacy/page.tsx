import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locales, isLocale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/pageMetadata'
import { privacyPolicy } from '@/content/legal'
import { siteConfig } from '@/lib/config'
import { breadcrumbSchema } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
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

  return pageMetadata({
    lang,
    path: 'privacy',
    title: doc.metaTitle ?? doc.title,
    description: doc.metaDescription ?? doc.intro,
  })
}

export default async function PrivacyPage({ params }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const doc = privacyPolicy[lang]

  return (
    <>
      {/* PROPEL > this page. Search Console reported 0 valid breadcrumbs
          sitewide on 2026-09-13, and four page pairs emitted none at all: the
          two hubs and the two legal pages. A hub's trail is two levels because
          that is the truth about where it sits. */}
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'PROPEL', url: `${siteConfig.url}/${lang}` },
          { name: doc.title, url: `${siteConfig.url}/${lang}/privacy` },
        ])}
      />
      <LegalPage lang={lang} doc={doc} />
    </>
  )
}
