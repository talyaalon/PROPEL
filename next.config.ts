import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // AVIF first, WebP as the fallback — meaningfully smaller than JPEG/PNG
    // for the screenshot-heavy portfolio pages.
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
}

export default nextConfig
