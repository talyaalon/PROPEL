import { locales, isLocale } from '@/lib/i18n'
import { mdxPosts } from '@/content/generated/posts'
import { shareCard, shareCardContentType, shareCardSize } from '@/lib/shareCard'

/**
 * The per-article link-preview card - README-PUBLISHING section 7.
 *
 * The site-wide card identifies the brand; an article shared into a WhatsApp
 * group has one job, and it is the headline. The card itself - including the
 * hand-rolled bidi reordering satori needs, and the fonts committed to the
 * repository so Hebrew renders at build with no network dependency - now lives
 * in `lib/shareCard.tsx`, because the case studies need exactly the same card.
 *
 * The middleware lets this through as a nested metadata leaf under a known
 * parent path.
 */

export const size = shareCardSize
export const contentType = shareCardContentType
export const alt = 'PROPEL'

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    mdxPosts.filter((post) => !post.draft).map((post) => ({ lang, slug: post.slug })),
  )
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const locale = isLocale(lang) ? lang : 'he'
  const post = mdxPosts.find((p) => p.slug === slug)

  return shareCard({
    lang: locale,
    eyebrow: locale === 'he' ? 'מהבלוג' : 'FROM THE BLOG',
    title: post?.ogTitle[locale] ?? 'PROPEL',
  })
}
