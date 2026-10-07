import type { Locale } from '@/lib/i18n'
import type { ServiceFaq } from '@/content/serviceDetail'

/**
 * A service page's visible FAQ.
 *
 * Separate from `ServiceDetailBody` only because of where it sits: the body
 * blocks come before the case-study proof and this comes after it, so a
 * reader meets the evidence before the objections.
 *
 * **Visible h3 + p, not a collapsed accordion.** The homepage FAQ uses
 * `<details>` and that is right there - it is a long list on a long page. Here
 * the rule that matters is README section 3's: an answer declared in a
 * `FAQPage` block has to exist as page text. These are the paragraphs the
 * schema on each service page names, and they are also the only prose on the
 * page written in the reader's own words rather than ours.
 *
 * The page owns the `FAQPage` JSON-LD rather than this component, because
 * `scripts/seo-audit.mjs` fails a page carrying more than one such block and
 * that limit is easier to reason about where the other schema is declared.
 */

type Props = {
  lang: Locale
  items: ServiceFaq[]
  title: string
  /** The page's clause counter - see the note in ServiceDetailBody. */
  clause: string
}

export default function ServiceFaqSection({ lang, items, title, clause }: Props) {
  if (items.length === 0) return null

  return (
    <section className="section" aria-labelledby="service-faq">
      <div className="mx-auto max-w-3xl">
        <h2 id="service-faq" className="text-brand-ink">
          <span className="clause" aria-hidden="true">
            {clause}
          </span>
          {title}
        </h2>
        <div className="mt-8 divide-y divide-brand-line border-t border-brand-line">
          {items.map((item) => (
            <div key={item.question[lang]} className="py-6">
              <h3 className="min-w-0 break-words text-[1.0625rem] font-bold text-brand-ink">
                {item.question[lang]}
              </h3>
              {/* `anywhere`: the answers name `WooCommerce`, `Base44`, `ODOO`
                  and `API`, and a Latin token is what sets a paragraph's
                  min-content width at 320px with 200% text. */}
              <p className="body-text mt-3 [overflow-wrap:anywhere]">{item.answer[lang]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
