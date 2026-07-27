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
