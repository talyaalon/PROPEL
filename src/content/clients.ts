/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CLIENT LOGOS — the "trusted by" strip under the hero
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  The strip renders only when this array has entries, so leaving it empty is a
 *  valid state. Nothing invented ever appears.
 *
 *  This is the highest-value real estate on the page after the headline: a row
 *  of recognisable names directly under the hero answers "has anyone actually
 *  hired these people?" before the visitor has scrolled once.
 *
 *  Ask permission before using a client's mark. Most are happy to say yes, and
 *  a name you cannot use is better replaced by the industry
 *  ("חברת לוגיסטיקה, 40 עובדים") in a testimonial than shown without consent.
 *
 *  Example entry:
 *
 *    { name: 'Acme', logo: '/clients/acme.svg', url: 'https://acme.co.il' }
 *
 *  Use SVG where possible, sized to roughly 120×40, in a single flat colour —
 *  the strip renders them in muted monochrome so mixed brand colours do not
 *  fight the page.
 */

export type Client = {
  /** Used as the image's accessible name. */
  name: string
  /** Path under /public. */
  logo: string
  /** Optional — makes the logo a link to the client's site. */
  url?: string
}

export const clients: Client[] = []
