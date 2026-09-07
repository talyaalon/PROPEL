import { getProjects } from '@/content/projects'
import { getServiceSlugs } from '@/content/services'
import { getInternalArticles } from '@/content/articles'
import { termsArePublished } from '@/content/terms'
import { isProductionDeploy } from '@/lib/config'

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
  // The services hub. The five service pages were reachable from the footer
  // and from nothing else; a set of leaves with no parent is what "crawled,
  // currently not indexed" looks like from Google's side.
  '/services',
  '/services/migration',
  // The URL a business card and a Google Business Profile point at. It
  // answered the soft 404 until now.
  '/contact',
  '/blog',
  '/not-a-fit',
  '/accessibility',
  '/privacy',
] as const

/**
 * Paths that are ROUTABLE but must not be ADVERTISED.
 *
 * This is the one place the two consumers of this module are allowed to
 * disagree, and the divergence is deliberate rather than drift.
 *
 * The terms page is an unreviewed draft. It has to be reachable on local and
 * preview builds so it can be read and approved, and it carries `noindex`
 * while it is a draft - which makes listing it in the sitemap a contradiction:
 * a sitemap says "index this" and the page says "do not". `scripts/seo-audit`
 * fails a page that is in both, correctly.
 *
 * So the middleware serves it and the sitemap does not mention it. Once
 * `termsArePublished` is true the entry disappears from here and the page
 * behaves like every other one - no other code changes.
 */
function unlistedPaths(): string[] {
  return termsArePublished ? [] : ['/terms']
}

/** Every path the middleware will serve. */
export function sitePaths(): string[] {
  return [
    ...staticPaths,
    /*
     * The terms draft, routable so it can be reviewed. On a production deploy
     * with the draft unapproved it is absent entirely and the URL answers the
     * 404 page - an unreviewed legal document is the one page that must not be
     * able to ship by accident.
     */
    ...(termsArePublished || !isProductionDeploy() ? ['/terms'] : []),
    ...getServiceSlugs().map((slug) => `/services/${slug}`),
    ...getProjects().map((project) => `/portfolio/${project.slug}`),
    // Draft articles are filtered inside getInternalArticles, with the same
    // production gate the pages use - so the sitemap, the middleware and the
    // prerendered routes cannot disagree about whether an article exists.
    ...getInternalArticles().map((article) => `/blog/${article.slug}`),
  ]
}

/**
 * Every path the sitemap should publish - `sitePaths()` minus anything that is
 * routable only for review. See `unlistedPaths`.
 */
export function sitemapPaths(): string[] {
  const unlisted = new Set(unlistedPaths())
  return sitePaths().filter((path) => !unlisted.has(path))
}
