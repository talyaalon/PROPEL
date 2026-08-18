import type { NextConfig } from 'next'

/**
 * Security headers are declared here rather than in `netlify.toml`.
 *
 * Netlify's `[[headers]]` rules do reach files under /_next/static, but HTML
 * pages are served through the Next.js runtime and bypass them — verified
 * against the live deploy, where the static CSS carried all four headers and
 * the pages carried none. Declaring them at the framework level applies them to
 * every response, and keeps them working if the site ever moves off Netlify.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
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
    // AVIF first, WebP as the fallback — meaningfully smaller than JPEG/PNG
    // for the screenshot-heavy portfolio pages.
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
