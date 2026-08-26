/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  TESTIMONIALS
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  The section renders only when this array has entries, so an empty list is a
 *  valid state - better no testimonials than invented ones.
 *
 *  An anonymous quote ("great service! - a happy client") is worth close to
 *  nothing. A name, a business and a photo is what makes it evidence. Ask for
 *  one right after a launch, while the relief is fresh.
 *
 *  Example entry:
 *
 *    {
 *      quote: {
 *        he: 'תוך חודש הפסקנו להקליד הזמנות ידנית. זה החזיר לנו יומיים בשבוע.',
 *        en: 'Within a month we stopped keying in orders by hand. It gave us back two days a week.',
 *      },
 *      name: 'ישראל ישראלי',
 *      role: { he: 'מנכ"ל, שם החברה', en: 'CEO, Company Name' },
 *      photo: '/testimonials/israel.webp',   // optional - initials are used when absent
 *    }
 */

import type { Bilingual } from './projects'

export type Testimonial = {
  quote: Bilingual
  /** Real name. Anonymous testimonials do not build trust. */
  name: string
  role: Bilingual
  /** Path under /public. Optional - falls back to initials. */
  photo?: string
}

export const testimonials: Testimonial[] = []
