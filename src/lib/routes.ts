import { getProjects } from '@/content/projects'

/**
 * Every path the site answers, after the locale prefix. THE list - the only
 * copy of it.
 *
 * Two consumers, and they must never disagree:
 *
 *  - `sitemap.ts` publishes it to crawlers.
 *  - `middleware.ts` treats anything absent from it as a 404.
 *
 * They started as two hand-maintained copies of the same six strings in two
 * files, which is a page-outage waiting to happen: add a route to the sitemap
 * only, and the middleware 404s a URL Google is being told to crawl.
 *
 * Project pages are derived from the content file, so publishing a case study
 * routes and gets crawled with no edit here.
 */
export const staticPaths = [
  '',
  '/portfolio',
  '/services/migration',
  '/blog',
  '/accessibility',
  '/privacy',
] as const

export function sitePaths(): string[] {
  return [...staticPaths, ...getProjects().map((project) => `/portfolio/${project.slug}`)]
}
