import type { NextConfig } from 'next'

/**
 * Security headers are declared here rather than in `netlify.toml`.
 *
 * Netlify's `[[headers]]` rules do reach files under /_next/static, but HTML
 * pages are served through the Next.js runtime and bypass them - verified
 * against the live deploy, where the static CSS carried all four headers and
 * the pages carried none. Declaring them at the framework level is what gets
 * them onto every page, and keeps them working if the site ever moves off
 * Netlify.
 *
 * ── What this does NOT cover, measured ──────────────────────────────────────
 *
 * This block used to claim it "applies them to every response". It does not.
 * Measured on production on 2026-10-08, header by header:
 *
 *   /he                                              all five present
 *   /he/opengraph-image                              all five present
 *   /he/blog/<slug>/opengraph-image                  all five present
 *   /paper.webp                                      NONE of them
 *
 * The line is drawn at the Next runtime, not at "HTML versus images": a
 * generated `opengraph-image` is a route and is covered, while a file sitting
 * in `public/` is served straight off Netlify's CDN and never consults a
 * `headers()` rule. So every page and every generated image carries the five;
 * the static assets in `public/` carry only what `netlify.toml` gives them,
 * which today is `Cache-Control` plus the HSTS that Netlify adds itself.
 *
 * The remaining gap is `X-Content-Type-Options: nosniff` on the files in
 * `public/` - the paper texture and the five project captures. It is real and
 * it is small: they are images served with a correct `Content-Type`, so
 * `nosniff` buys little. It is written up as a recommendation in
 * docs/seo-audit-report.md rather than fixed here, because it is a security
 * change and that report is an SEO audit.
 *
 * One correction worth leaving in place, because the first draft of this
 * comment got it backwards: a `headers()` rule here CAN reach an
 * `opengraph-image` response. The `X-Robots-Tag` experiment described at the
 * bottom of this file would have worked technically. It was removed because it
 * was the wrong thing to want, not because it could not fire.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  /*
   * REPORT-ONLY, deliberately, and here rather than in netlify.toml.
   *
   * It was added to netlify.toml first and deployed. Measured on production:
   * present on /paper.webp, absent on /he - because Netlify's header rules do
   * not reach HTML served by the Next runtime. That is the exact trap the
   * comment at the top of this list already records for the other four
   * headers, and I walked into it anyway.
   *
   * It shipped report-only, which was the right way to start and the wrong
   * way to stay: `Content-Security-Policy-Report-Only` with no `report-uri`
   * neither enforces anything nor reports anything to anyone. It was a header
   * that cost bytes and bought nothing, and an audit on 2026-09-13 called that
   * correctly.
   *
   * Enforcing now, after establishing that the policy is already satisfied.
   * Every origin referenced by the served pages was enumerated: the HTML
   * references only propel.co.il, the three client sites and wa.me, all of them
   * link targets rather than subresources, plus the w3.org and schema.org
   * namespace URIs that live in SVG and JSON-LD attributes and are never
   * fetched. The built CSS references no external origin at all. Fonts are
   * self-hosted. There is no third-party script on the site.
   *
   * `'unsafe-inline'` on script-src stays: Next's bootstrap needs it, and
   * removing it means threading a nonce through the layout, which is a real
   * change rather than a header rename.
   *
   * The googletagmanager and google-analytics origins stay too, and they are
   * not dead weight even though no analytics is installed. `layout.tsx` carries
   * a GA4 snippet gated on `NEXT_PUBLIC_GA4_ID`; the day that variable is set
   * in Netlify the tag has to be allowed to load, and a CSP that silently
   * blocks it would be debugged from scratch by whoever sets it.
   */
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://www.googletagmanager.com",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  /*
   * The deploy context, frozen at BUILD time into every bundle - middleware
   * included. `isProductionDeploy()` used to read process.env.CONTEXT at
   * runtime, and on Netlify's edge runtime that variable does not exist: the
   * middleware decided drafts were visible while the built pages knew they
   * were not, let a draft article's URL through to a route that had not been
   * prerendered, and the visitor got Next's bare 404 - no lang, no dir, no
   * chrome. Found live, on the first draft ever deployed. Inlining makes the
   * middleware, the sitemap and the pages agree by construction: they were
   * all built in the same breath.
   */
  env: {
    DEPLOY_CONTEXT: process.env.CONTEXT ?? process.env.VERCEL_ENV ?? '',
  },

  images: {
    // AVIF first, WebP as the fallback - meaningfully smaller than JPEG/PNG
    // for the screenshot-heavy portfolio pages.
    formats: ['image/avif', 'image/webp'],
    /*
     * Pinned, not inherited. Next's own default is 60s; Netlify's runtime was
     * serving a day, which is the number we want but not one we chose. The
     * sources are un-hashed files in public/, so the reasoning matches the
     * cache block in netlify.toml: long enough to pay off, short enough that a
     * replaced image is not stranded.
     */
    minimumCacheTTL: 86400,
  },
  poweredByHeader: false,

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      /*
       * NO `X-Robots-Tag: noindex` on the share cards, and the reason is worth
       * writing down because the opposite was tried on this branch.
       *
       * Search Console reports
       * `/he/blog/branch-leakage-case-study/opengraph-image` as "crawled,
       * currently not indexed", and a noindex header was added to settle it.
       * That was wrong. Google requires the image in structured data to be
       * crawlable AND indexable, and this site declares exactly these URLs as
       * `Article.image` on every article and as the organization's `image` on
       * every page. The header made both properties dead weight - it disabled
       * the article image in search results in order to tidy a status line
       * that is not an error. "Crawled, currently not indexed" is the correct
       * resting state for an image route: it is fetched by WhatsApp and
       * LinkedIn when a link is pasted, and it does not compete for a ranking.
       *
       * If these ever DO need to be excluded, remove `image` from
       * `articleSchema` and repoint the organization's image first.
       */
    ]
  },
}

export default nextConfig
