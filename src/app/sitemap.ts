import type { MetadataRoute } from 'next'
import { locales } from '@/lib/i18n'
import { siteConfig } from '@/lib/config'
import { getProjects } from '@/content/projects'

/**
 * Every page in both languages.
 *
 * Two things this deliberately does not do.
 *
 * **No `lastModified`.** It was `new Date()`, so every deploy told Google that
 * all eighteen pages had changed - including the privacy policy, which had
 * not. A timestamp that is always "now" carries no information and teaches the
 * crawler to ignore the field. Real per-path dates would need the content to
 * carry them; until it does, saying nothing is more honest than saying
 * something false.
 *
 * **No hreflang alternates.** Google's guidance is that the three methods -
 * HTML `<link rel="alternate">`, the sitemap, and the HTTP header - are
 * equivalent, with no benefit to running more than one. This site ran two, and
 * they disagreed: the HTML set includes `x-default` and this one did not. The
 * HTML set is the more complete, so it is the one that stays. It is emitted
 * from `src/lib/pageMetadata.ts` for every route.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ['', '/portfolio', '/blog', '/accessibility', '/privacy']
  const projectPaths = getProjects().map((project) => `/portfolio/${project.slug}`)
  const allPaths = [...staticPaths, ...projectPaths]

  return allPaths.flatMap((path) =>
    locales.map((lang) => ({
      url: `${siteConfig.url}/${lang}${path}`,
      changeFrequency: path === '' ? ('weekly' as const) : ('monthly' as const),
      priority: path === '' ? 1 : path.startsWith('/portfolio') || path === '/blog' ? 0.8 : 0.3,
    })),
  )
}
