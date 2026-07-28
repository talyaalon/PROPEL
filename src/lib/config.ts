/**
 * Central site configuration.
 *
 * Every externally-visible constant (phone, domain, email) lives here and is
 * sourced from the environment, so a placeholder can never quietly ship.
 * See `.env.example` for the full list.
 */

// ── Placeholder sentinels ─────────────────────────────────────────────────────
// These are the values the project shipped with before real details existed.
// `assertProductionConfig()` refuses to build a production deploy that still
// uses them — a dead WhatsApp link is worse than a failed build.

const PLACEHOLDER_PHONE = '972501234567'
const PLACEHOLDER_DOMAIN = 'https://propel.co.il'

// ── Values ────────────────────────────────────────────────────────────────────

export const siteConfig = {
  /** Canonical origin, no trailing slash. Used for canonical URLs, hreflang, sitemap, OG. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? PLACEHOLDER_DOMAIN).replace(/\/$/, ''),

  /** International format, digits only — e.g. 972501234567. Used for every wa.me deep link. */
  whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? PLACEHOLDER_PHONE,

  /** Displayed in the footer and used as the tel: link target. */
  phoneDisplay: process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? '',

  /** Public contact address, shown in the footer. */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? '',

  /** Where the contact form delivers. Server-side only. */
  inboxEmail: process.env.CONTACT_INBOX_EMAIL ?? '',

  /** Registered business name + number, shown in the footer for B2B credibility. */
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME ?? '',
  businessId: process.env.NEXT_PUBLIC_BUSINESS_ID ?? '',

  /**
   * Named accessibility coordinator. Israeli accessibility regulations require
   * the statement to name a person and a way to reach them.
   */
  a11yContactName: process.env.NEXT_PUBLIC_A11Y_CONTACT_NAME ?? '',

  /** Last review date of the legal pages, ISO format. */
  legalUpdated: process.env.NEXT_PUBLIC_LEGAL_UPDATED ?? '2026-07-27',
} as const

// ── Deploy environment ────────────────────────────────────────────────────────

/**
 * True only for a real production deploy — not for local builds and not for
 * branch/preview deploys.
 *
 * Checked per host rather than through `NODE_ENV`, because `npm run build`
 * locally also sets NODE_ENV=production and would then hide draft content and
 * fail the config guard during ordinary development.
 *
 *   Netlify → CONTEXT is 'production' | 'deploy-preview' | 'branch-deploy'
 *   Vercel  → VERCEL_ENV is 'production' | 'preview' | 'development'
 *
 * `PROPEL_PRODUCTION=1` is the escape hatch for any other host.
 */
export function isProductionDeploy(): boolean {
  return (
    process.env.CONTEXT === 'production' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.PROPEL_PRODUCTION === '1'
  )
}

// ── Guards ────────────────────────────────────────────────────────────────────

/** True when a value is still the shipped-with-the-template placeholder. */
export const usesPlaceholderPhone = siteConfig.whatsappPhone === PLACEHOLDER_PHONE
export const usesPlaceholderDomain = siteConfig.url === PLACEHOLDER_DOMAIN

/**
 * Hard-fails a real production deploy that still carries placeholder contact
 * details. Local and preview builds only warn, so development is never blocked.
 */
export function assertProductionConfig(): void {
  const problems: string[] = []

  if (usesPlaceholderPhone) {
    problems.push(
      'NEXT_PUBLIC_WHATSAPP_PHONE is still the placeholder — every CTA on the site is a dead link.',
    )
  }
  if (usesPlaceholderDomain) {
    problems.push(
      'NEXT_PUBLIC_SITE_URL is still the placeholder — canonical URLs, hreflang and OG tags point at a domain you do not own.',
    )
  }

  if (problems.length === 0) return

  const message = `[PROPEL config]\n  - ${problems.join('\n  - ')}`

  if (isProductionDeploy()) {
    throw new Error(
      `${message}\n\nSet these in your project's environment variables before deploying to production.`,
    )
  }

  console.warn(
    `${message}\n  (This is a warning locally; it becomes a build failure on a production deploy.)`,
  )
}
