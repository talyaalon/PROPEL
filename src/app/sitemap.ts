import type { MetadataRoute } from 'next'
import { locales } from '@/lib/i18n'
import { siteConfig } from '@/lib/config'
import { sitePaths } from '@/lib/routes'
import { lastContentChange } from '@/lib/contentDates'
import { getInternalArticles } from '@/content/articles'

/**
 * Every page in both languages.
 *
 * **`lastModified` is a real date or it is absent.** It used to be
 * `new Date()`, so every deploy told Google that all eighteen pages had
 * changed, including the privacy policy. A timestamp that is always "now"
 * carries no information and teaches the crawler to ignore the field. So each
 * path is mapped to the file its content actually lives in, and the date is
 * that file's last commit - see `lib/contentDates.ts`, which refuses to
 * answer at all on a shallow clone rather than hand back the deploy date.
 * Articles keep their own front-matter date, which is truer still.
 *
 * **`changeFrequency` and `priority` are gone, not corrected.** Google has
 * stated for years that it ignores both, and they were actively wrong here:
 * every case study and the blog index carried 0.8 while the five service
 * pages - the ones the business is trying to rank - carried 0.3. A field no
 * consumer reads cannot be fixed, only removed.
 *
 * **hreflang is here as well as in the HTML.** The two sets must agree, and
 * the reason this file did not carry them is that it once disagreed with the
 * HTML: it had no `x-default`. Both are generated from `locales` now, with
 * `x-default` pointing at Hebrew exactly as `pageMetadata` does, so there is
 * one shape in two places rather than two shapes.
 */

/**
 * Path prefix -> the file whose content produces those pages.
 *
 * Longest match wins, so `/portfolio/acme` resolves to the projects file
 * rather than to the dictionary that produces the index above it.
 */
const CONTENT_SOURCE: { prefix: string; file: string }[] = [
  { prefix: '/portfolio/', file: 'src/content/projects.ts' },
  { prefix: '/services/', file: 'src/content/services.ts' },
  { prefix: '/accessibility', file: 'src/content/legal.ts' },
  { prefix: '/privacy', file: 'src/content/legal.ts' },
  // The copy for the homepage, both indexes and the not-a-fit page lives in
  // the dictionaries and nowhere else.
  { prefix: '', file: 'src/dictionaries/he.json' },
]

function sourceFile(path: string): string {
  const match = CONTENT_SOURCE.filter((entry) => path.startsWith(entry.prefix)).sort(
    (a, b) => b.prefix.length - a.prefix.length,
  )[0]
  return match.file
}

export default function sitemap(): MetadataRoute.Sitemap {
  // One list, shared with the middleware - see src/lib/routes.ts for why.
  const allPaths = sitePaths()

  // slug -> ISO date, for the content that carries a real one of its own.
  const articleDates = new Map(
    getInternalArticles().map((article) => [
      `/blog/${article.slug}`,
      article.updated ?? article.date,
    ]),
  )

  return allPaths.flatMap((path) => {
    const lastModified = articleDates.get(path) ?? lastContentChange(sourceFile(path))

    return locales.map((lang) => ({
      url: `${siteConfig.url}/${lang}${path}`,
      ...(lastModified ? { lastModified } : {}),
      alternates: {
        languages: {
          ...Object.fromEntries(
            locales.map((alt) => [alt, `${siteConfig.url}/${alt}${path}`]),
          ),
          // Hebrew is the default for an Israeli business, and this is the one
          // entry the HTML set had and this file did not.
          'x-default': `${siteConfig.url}/he${path}`,
        },
      },
    }))
  })
}
