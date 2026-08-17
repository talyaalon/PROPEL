/**
 * Central site configuration.
 *
 * Every externally-visible constant (phone, domain, email) lives here and is
 * sourced from the environment, so a placeholder can never quietly ship.
 * See `.env.example` for the full list.
 */

// ── The business's public contact details ─────────────────────────────────────
//
// Committed, not left to the environment. These are `NEXT_PUBLIC_*` values: they
// are inlined into the client bundle at build time and printed on every page of
// a public website, so there is no secret here to protect. Keeping them in a
// dashboard bought nothing and cost three rounds of the site serving a phone
// number the owner had already replaced twice - because the code was right, the
// deploy was stale, and nothing in the repo could tell the difference.
//
// The environment still wins where it is set, so a preview deploy or a fork can
// override any of them. But an unset variable now yields the real value rather
// than an empty string.
//
// The one number in two forms: `053-715-4945` is what a reader sees, and
// `972537154945` is the same number as wa.me needs it - digits only, country
// code, no leading zero. They must never drift apart; a business with two
// numbers is what breaks a Google Business Profile.

const PHONE_DISPLAY = '053-715-4945'
const WHATSAPP_PHONE = '972537154945'
const CONTACT_EMAIL = 'shlomoisrael435@gmail.com'

/*
 * Deliberately unbuyable. This used to be `https://propel.co.il` - which is the
 * domain the business went on to actually register, so setting the real value
 * would have made `usesPlaceholderDomain` true and failed the production build
 * with an error insisting the domain was still a placeholder. `.invalid` is
 * reserved by RFC 2606 and can never resolve, so no real value can collide
 * with it.
 */
const PLACEHOLDER_DOMAIN = 'https://REPLACE-ME.invalid'

/**
 * An Israeli number in the form a machine dials, from the form a person reads.
 *
 *   053-715-4945  ->  +972537154945
 *
 * The page shows the local form, because that is what an Israeli visitor
 * recognises. `tel:` and schema.org's `telephone` both want the international
 * one: a bare `0537154945` is ambiguous to anything outside the country, and
 * Google treats an un-dialable `telephone` as no telephone at all.
 *
 * Anything already in international form is passed through, so a number written
 * as +972... or 972... keeps working.
 */
export function toInternational(local: string): string {
  const digits = local.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return digits
  if (digits.startsWith('972')) return `+${digits}`
  if (digits.startsWith('0')) return `+972${digits.slice(1)}`
  return digits
}

// ── Values ────────────────────────────────────────────────────────────────────

export const siteConfig = {
  /** Canonical origin, no trailing slash. Used for canonical URLs, hreflang, sitemap, OG. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? PLACEHOLDER_DOMAIN).replace(/\/$/, ''),

  /** International format, digits only. Used for every wa.me deep link. */
  whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || WHATSAPP_PHONE,

  /** As printed on the page - the local form an Israeli visitor recognises. */
  phoneDisplay: process.env.NEXT_PUBLIC_PHONE_DISPLAY || PHONE_DISPLAY,

  /** The same number in the form `tel:` and schema.org want. */
  phoneDial: toInternational(process.env.NEXT_PUBLIC_PHONE_DISPLAY || PHONE_DISPLAY),

  /** Public contact address, shown in the footer. */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || CONTACT_EMAIL,

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

/**
 * True when the domain is still the sentinel.
 *
 * The phone and email guards that used to live here are gone, not relaxed: the
 * values are committed above, so an unset variable can no longer produce an
 * empty phone or a placeholder WhatsApp link. A guard that cannot fire is worse
 * than no guard - it reads as protection.
 */
export const usesPlaceholderDomain = siteConfig.url === PLACEHOLDER_DOMAIN

/**
 * Hard-fails a real production deploy that still carries placeholder contact
 * details. Local and preview builds only warn, so development is never blocked.
 */
export function assertProductionConfig(): void {
  const problems: string[] = []

  if (usesPlaceholderDomain) {
    problems.push(
      'NEXT_PUBLIC_SITE_URL is still the placeholder - canonical URLs, hreflang and OG tags point at a domain you do not own.',
    )
  }

  /*
   * No guard on the accessibility coordinator, deliberately.
   *
   * There was one, and it was right when the statement's heading read
   * "Accessibility coordinator" over a phone number and an email with no name
   * under it. The heading is "Accessibility enquiries" now, which is what the
   * block actually is - and the Israeli regulations require a *named*
   * coordinator only above a headcount threshold a one-person agency is below.
   *
   * So there is nothing left to fail the build over. A name is still worth
   * adding; it is no longer a defect that one is missing.
   */

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
