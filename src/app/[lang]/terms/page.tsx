import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locales, isLocale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/pageMetadata'
import { termsOfUse, termsArePublished } from '@/content/terms'
import LegalPage from '@/components/LegalPage'

/**
 * Terms of use.
 *
 * The route is built in every environment; whether the URL is reachable is
 * decided by `sitePaths()`, which includes /terms only while the draft is
 * unpublished-but-previewable or approved. On a production deploy with
 * `termsArePublished` false the middleware answers this URL with the 404 page,
 * so an unreviewed legal document cannot be read by a visitor - and the
 * `noindex` below means that even if it were reachable it would not be
 * indexed while it is still a draft.
 */

type Props = {
  params: Promise<{ lang: string }>
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}

  const doc = termsOfUse[lang]
  const base = pageMetadata({
    lang,
    path: 'terms',
    title: doc.title,
    description: doc.intro,
  })

  // A draft is not a page for a search engine to hold an opinion about.
  return termsArePublished ? base : { ...base, robots: { index: false, follow: true } }
}

export default async function TermsPage({ params }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  return <LegalPage lang={lang} doc={termsOfUse[lang]} />
}
