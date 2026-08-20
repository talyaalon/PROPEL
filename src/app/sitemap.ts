import type { MetadataRoute } from 'next'
import { locales } from '@/lib/i18n'
import { siteConfig } from '@/lib/config'
import { sitePaths } from '@/lib/routes'
import { getInternalArticles } from '@/content/articles'

/**
 * Every page in both languages.
 *
 * Two things this deliberately does not do.
 *
 * **`lastModified` only where a real date exists.** It used to be
 * `new Date()`, so every deploy told Google that all eighteen pages had
 * changed - including the privacy policy, which had not. A timestamp that is
 * always "now" carries no information and teaches the crawler to ignore the
 * field.
 *
 * Articles carry a genuine publication date, so they get one. Nothing else
 * does: a file mtime is the checkout time on a fresh CI clone, which is the
 * same lie in a new hat. The honest options for the rest are a git commit
 * date per content file, or silence - and silence costs nothing, because
 * Google treats a missing lastmod as "unknown" rather than "never".
 *
 * **No hreflang alternates.** Google's guidance is that the three methods -
 * HTML `<link rel="alternate">`, the sitemap, and the HTTP header - are
 * equivalent, with no benefit to running more than one. This site ran two, and
 * they disagreed: the HTML set includes `x-default` and this one did not. The
 * HTML set is the more complete, so it is the one that stays. It is emitted
 * from `src/lib/pageMetadata.ts` for every route.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // One list, shared with the middleware - see src/lib/routes.ts for why.
  const allPaths = sitePaths()

  // slug -> ISO date, for the only content that carries a real one.
  const articleDates = new Map(
    getInternalArticles().map((article) => [`/blog/${article.slug}`, article.date]),
  )

  return allPaths.flatMap((path) =>
    locales.map((lang) => ({
      url: `${siteConfig.url}/${lang}${path}`,
      ...(articleDates.has(path) ? { lastModified: articleDates.get(path) } : {}),
      changeFrequency: path === '' ? ('weekly' as const) : ('monthly' as const),
      priority: path === '' ? 1 : path.startsWith('/portfolio') || path === '/blog' ? 0.8 : 0.3,
    })),
  )
}
