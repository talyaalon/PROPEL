/**
 * Central site configuration.
 *
 * Every externally-visible constant (phone, domain, email) lives here and is
 * sourced from the environment, so a placeholder can never quietly ship.
 * See `.env.example` for the full list.
 */

// ── The business's phone number ───────────────────────────────────────────────
//
// **One raw value. Every other form is derived from it below.**
//
// This is the whole fix for a bug that reached production: the site served
// `050-515-4143` on every `tel:` link and `+972537154945` on every WhatsApp
// link. Whoever tapped "call" and whoever tapped WhatsApp reached different
// numbers. On a site whose entire pitch is that we fix broken processes, that
// is the worst contradiction available.
//
// The cause was structural, not a typo. Display and WhatsApp were two separate
// environment variables, so nothing anywhere could notice they had drifted
// apart - and `NEXT_PUBLIC_PHONE_DISPLAY` in the deploy dashboard was stale.
//
// So the number is committed, and the environment can no longer override it.
// That is deliberate and it is the point:
//
//   - It is a `NEXT_PUBLIC_*` value. It is inlined into the client bundle and
//     printed on every page of a public website. There is no secret to protect
//     and nothing was ever bought by keeping it in a dashboard.
//   - A dashboard is not version-controlled, not reviewed, and not visible from
//     the code. The repo said the right number for three deploys while the live
//     site said the wrong one, and nothing in the repo could tell.
//   - An override is only useful if someone should be able to change the phone
//     number without a commit. Nobody should.
//
// To change the number: edit the line below. That is the entire procedure, and
// `scripts/check-contact.mjs` fails the build if any other Israeli mobile
// number reaches the rendered output.

const PHONE_RAW = '053-715-4945'

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

/**
 * The same number as wa.me wants it: digits only, country code, no `+`.
 *
 *   053-715-4945  ->  972537154945
 *
 * Derived from `toInternational` rather than written out, so the WhatsApp link
 * and the `tel:` link cannot describe different numbers. That drift is the
 * exact defect this module now exists to prevent.
 */
export function toWhatsApp(local: string): string {
  return toInternational(local).replace(/\D/g, '')
}

// ── Values ────────────────────────────────────────────────────────────────────

export const siteConfig = {
  /** Canonical origin, no trailing slash. Used for canonical URLs, hreflang, sitemap, OG. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? PLACEHOLDER_DOMAIN).replace(/\/$/, ''),

  /*
   * The three phone forms, all derived from `PHONE_RAW`. No environment
   * variable is read here on purpose - see the note above the constant.
   */

  /** As printed on the page - the local form an Israeli visitor recognises. */
  phoneDisplay: PHONE_RAW,

  /** The same number as `tel:` and schema.org's `telephone` want it. */
  phoneDial: toInternational(PHONE_RAW),

  /** The same number as wa.me wants it. Used for every WhatsApp deep link. */
  whatsappPhone: toWhatsApp(PHONE_RAW),

  /*
   * Public contact address. Environment-only, and with no fallback on purpose.
   *
   * Unlike the phone, this address does not exist yet - `hello@propel.co.il`
   * needs MX records and a mailbox before it can receive anything. A committed
   * default would print an address that bounces, and a bounced enquiry is worse
   * than no address at all: the sender believes they made contact.
   *
   * Every consumer already guards on truthiness, so while this is unset the
   * email row simply does not render and the visitor is offered WhatsApp, the
   * phone and the form instead. Set it once the mailbox answers.
   */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? '',

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
