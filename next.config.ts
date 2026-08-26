import type { NextConfig } from 'next'

/**
 * Security headers are declared here rather than in `netlify.toml`.
 *
 * Netlify's `[[headers]]` rules do reach files under /_next/static, but HTML
 * pages are served through the Next.js runtime and bypass them - verified
 * against the live deploy, where the static CSS carried all four headers and
 * the pages carried none. Declaring them at the framework level applies them to
 * every response, and keeps them working if the site ever moves off Netlify.
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
   * Report-only because CSP is the one security header that can take a site
   * down if it is wrong, and Next ships inline bootstrap scripts a naive
   * policy blocks instantly. Watch the browser console on production, confirm
   * nothing is blocked, and only then rename the key to
   * 'Content-Security-Policy'. `'unsafe-inline'` on script-src is required by
   * that bootstrap; removing it needs a nonce threaded through the layout.
   */
  {
    key: 'Content-Security-Policy-Report-Only',
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
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
