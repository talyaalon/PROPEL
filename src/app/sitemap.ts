import type { MetadataRoute } from 'next'
import { locales } from '@/lib/i18n'
import { siteConfig } from '@/lib/config'
import { sitemapPaths } from '@/lib/routes'
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
 * Path prefix -> the file or files whose content produces those pages.
 *
 * Longest match wins, so `/portfolio/acme` resolves to the projects file
 * rather than to the dictionary that produces the index above it.
 *
 * **`files`, plural, and the newest commit among them wins.** It was one file
 * per prefix, and that silently went wrong the moment a page's copy was split
 * across two modules: the five service pages took their date from
 * `content/services.ts` alone, so the commit that added ~600 words of body to
 * each of them - audience, process, price factors, FAQ, all in
 * `content/serviceDetail.ts` - would have told Google those five URLs had not
 * changed. A lastmod that is wrong for one URL is what teaches a crawler to
 * ignore the field on all 42, which is the exact reasoning that put real dates
 * here in the first place.
 */
const CONTENT_SOURCE: { prefix: string; files: string[] }[] = [
  { prefix: '/portfolio/', files: ['src/content/projects.ts'] },
  /*
   * Before the '/services/' entry below, and longest match wins. The migration
   * page predates content/services.ts and reads its headline copy from
   * `dict.migration`, so dating it from services.ts told Google it had not
   * changed on the commit that rewrote its meta description - and would tell
   * Google it HAD changed whenever one of the five other service pages was
   * edited.
   *
   * It takes its second half from `serviceDetail.ts` like the other five, so
   * that file is listed here too and the newest of the two dates wins.
   */
  {
    prefix: '/services/migration',
    files: ['src/dictionaries/he.json', 'src/content/serviceDetail.ts'],
  },
  { prefix: '/services/', files: ['src/content/services.ts', 'src/content/serviceDetail.ts'] },
  { prefix: '/accessibility', files: ['src/content/legal.ts'] },
  { prefix: '/privacy', files: ['src/content/legal.ts'] },
  // The copy for the homepage, the services hub, both indexes, the contact
  // page and the not-a-fit page lives in the dictionaries and nowhere else.
  { prefix: '', files: ['src/dictionaries/he.json'] },
]

function sourceFiles(path: string): string[] {
  const match = CONTENT_SOURCE.filter((entry) => path.startsWith(entry.prefix)).sort(
    (a, b) => b.prefix.length - a.prefix.length,
  )[0]
  return match.files
}

/**
 * The newest commit date among a page's source files, or undefined when none
 * of them can be dated honestly.
 *
 * ISO 8601 with the same offset sorts lexicographically, and `lastContentChange`
 * returns `%cI` for every file from the same repository - so a string compare is
 * a date compare here, with no Date parsing to get wrong.
 */
function newestChange(files: string[]): string | undefined {
  return files
    .map((file) => lastContentChange(file))
    .filter((date): date is string => Boolean(date))
    .sort()
    .pop()
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Shared with the middleware, minus anything routable only for review -
  // see `unlistedPaths` in src/lib/routes.ts for the one case and why.
  const allPaths = sitemapPaths()

  // slug -> ISO date, for the content that carries a real one of its own.
  const articleDates = new Map(
    getInternalArticles().map((article) => [
      `/blog/${article.slug}`,
      article.updated ?? article.date,
    ]),
  )

  return allPaths.flatMap((path) => {
    const lastModified = articleDates.get(path) ?? newestChange(sourceFiles(path))

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
