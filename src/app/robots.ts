import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/config'

/**
 * Crawl rules.
 *
 * Two deliberate absences, both of which have been proposed and rejected:
 *
 * **No `host`.** It was here, and only Yandex has ever read it - Google
 * ignores it outright. The canonical host is settled by the 301 from the
 * netlify.app domain and by the self-referential `<link rel="canonical">` on
 * every page, which are the two mechanisms that actually decide it.
 *
 * **No `Disallow` for the generated share cards.** The `opengraph-image`
 * route is what WhatsApp and LinkedIn fetch when someone pastes a link, and
 * disallowing it would stop them fetching it - on a site whose main
 * distribution channel is WhatsApp, that breaks every share preview to keep a
 * PNG out of an index it was never going to rank in.
 *
 * They do NOT carry `X-Robots-Tag: noindex` either, and this comment used to
 * say they did. It was true for about one commit. The header was added, then
 * removed again with the reasoning now at the bottom of `next.config.ts`: the
 * site declares these exact URLs as `Article.image` and as the organization's
 * `image`, and Google requires an image in structured data to be crawlable
 * AND indexable, so the header quietly disabled every article image in search
 * to tidy a status line that is not an error.
 *
 * Measured on production on 2026-10-08, because a comment asserting a header
 * is not evidence of one:
 *
 *   curl -sI https://propel.co.il/he/opengraph-image | grep -i x-robots-tag
 *   (no output)
 *
 * So both image routes are fully crawlable and indexable, on purpose. Search
 * Console reports them as "crawled, currently not indexed", which is the
 * correct resting state for a URL that exists to be fetched by a chat client
 * and does not compete for a ranking. There is nothing to fix and nothing to
 * validate. See docs/seo-audit-report.md section F for the decision.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
