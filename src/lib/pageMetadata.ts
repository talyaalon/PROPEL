import type { Metadata } from 'next'
import { siteConfig } from './config'
import type { Locale } from './i18n'

/**
 * Canonical, hreflang and social tags for one page.
 *
 * App Router metadata merges shallowly: a page that sets `title` but not
 * `openGraph` inherits the *whole* parent `openGraph` object, including its
 * `url`. Six pages did exactly that - blog, privacy and accessibility in both
 * locales - so each of them told WhatsApp, Facebook and LinkedIn it was the
 * homepage. Correct title, correct canonical, wrong share card. On a site whose
 * distribution channel is WhatsApp, that is the link being wrong.
 *
 * The case studies had the mirror-image bug: they set `openGraph` without
 * `images`, which stops the parent's `opengraph-image` route from resolving,
 * and left `twitter` inherited. Ten URLs promising `summary_large_image` with
 * no image, under the homepage's title.
 *
 * Building all of it from one place is what stops the next page repeating it.
 */
export function pageMetadata({
  lang,
  path,
  title,
  description,
  type = 'website',
}: {
  lang: Locale
  /** Path after the locale, no leading slash. Empty string for the homepage. */
  path: string
  title: string
  description: string
  type?: 'website' | 'article'
}): Metadata {
  const suffix = path ? `/${path}` : ''
  const url = `${siteConfig.url}/${lang}${suffix}`

  /*
   * The homepage's own title already opens with the brand, so appending it
   * unconditionally produced "PROPEL | בניית אתרים ואוטומציה לעסקים | PROPEL"
   * on the one URL most likely to be pasted into a chat. Case studies and blog
   * posts were unaffected, which is why it survived.
   */
  const social = title.includes('PROPEL') ? title : `${title} | PROPEL`

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        he: `${siteConfig.url}/he${suffix}`,
        en: `${siteConfig.url}/en${suffix}`,
        'x-default': `${siteConfig.url}/he${suffix}`,
      },
    },
    openGraph: {
      type,
      siteName: 'PROPEL',
      title: social,
      description,
      url,
      locale: lang === 'he' ? 'he_IL' : 'en_US',
      /*
       * Explicit, because setting `openGraph` at page level otherwise stops the
       * parent's opengraph-image route from being resolved at all - and with
       * the dimensions, because a bare URL forces WhatsApp and LinkedIn to
       * fetch the image before they can lay the card out. Next supplies all
       * four automatically for the route it resolves itself; a hand-written
       * entry has to carry them.
       */
      images: [
        {
          url: `${siteConfig.url}/${lang}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: social,
      description,
      images: [`${siteConfig.url}/${lang}/opengraph-image`],
    },
  }
}
