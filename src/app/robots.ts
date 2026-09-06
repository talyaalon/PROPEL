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
 * PNG out of an index it was never going to rank in. They carry
 * `X-Robots-Tag: noindex` from next.config.ts instead, which is the header
 * that removes them from search while leaving them readable. A crawler has to
 * be allowed to fetch a URL in order to see that it is noindex, so the two
 * rules are mutually exclusive and this is the one that keeps both properties.
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
