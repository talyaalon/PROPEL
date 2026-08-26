import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Locale } from './i18n'

/**
 * Resolves the logo artwork for a locale, or null when none has been added.
 *
 * Server-side only - it touches the filesystem. The result is passed down as a
 * plain string prop, because `Navigation` is a client component and importing
 * this module into it would drag `node:fs` into the browser bundle.
 *
 * Files are looked up in order of preference:
 *   public/logo-<lang>.{webp,png,jpg}   per locale
 *   public/logo.{webp,png,jpg}          one file for both
 */

const EXTENSIONS = ['webp', 'png', 'jpg'] as const

export function getLogoSrc(lang: Locale): string | null {
  const names = [
    ...EXTENSIONS.map((ext) => `logo-${lang}.${ext}`),
    ...EXTENSIONS.map((ext) => `logo.${ext}`),
  ]

  for (const name of names) {
    if (existsSync(join(process.cwd(), 'public', name))) return `/${name}`
  }
  return null
}
