import type { MetadataRoute } from 'next'
import { locales } from '@/lib/i18n'
import { siteConfig } from '@/lib/config'
import { getProjects } from '@/content/projects'

/**
 * Every page in both languages, cross-linked with hreflang alternates so Google
 * treats the two locales as one document rather than as duplicates.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ['', '/accessibility', '/privacy']
  const projectPaths = getProjects().map((project) => `/portfolio/${project.slug}`)
  const allPaths = [...staticPaths, ...projectPaths]

  return allPaths.flatMap((path) =>
    locales.map((lang) => ({
      url: `${siteConfig.url}/${lang}${path}`,
      lastModified: new Date(),
      changeFrequency: path === '' ? ('weekly' as const) : ('monthly' as const),
      priority: path === '' ? 1 : path.startsWith('/portfolio') ? 0.8 : 0.3,
      alternates: {
        languages: Object.fromEntries(
          locales.map((alt) => [alt, `${siteConfig.url}/${alt}${path}`]),
        ),
      },
    })),
  )
}
