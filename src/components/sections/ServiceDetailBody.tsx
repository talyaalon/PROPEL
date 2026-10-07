import { Check } from 'lucide-react'
import type { Locale } from '@/lib/i18n'
import type { ServiceDetail } from '@/content/serviceDetail'

/**
 * The shared body of a service page: who it is for, the stages, the price
 * factors, and whatever extra H2 that one service needs.
 *
 * One component rather than two copies, because there are two routes that
 * render a service page and they have drifted before. `/services/[service]`
 * covers the five in `content/services.ts`; `/services/migration` predates
 * that file, keeps its own route and reads its headline copy from the
 * dictionary. The blocks below are identical on both, and a second hand-built
 * copy of five sections is how the breadcrumb hub level came to be missing
 * from one of them and present on the other.
 *
 * The FAQ is a separate component, not an extra block here, because it is
 * rendered AFTER the case-study proof on both pages while these sit before
 * it. See `ServiceFaqSection`.
 *
 * Clause numbers (docs/design-language.md #1) arrive as finished strings and
 * are not drawn from a counter here. That is deliberate and it was the second
 * attempt: a `nextClause()` callback reads correctly and produces the wrong
 * document. A child component renders AFTER its parent's JSX has been built,
 * so the parent's own `proof` and `faq` sections would have taken 03 and 04
 * while these four took 03 to 06 - two sections numbered 03, on every service
 * page. The whole sequence is therefore computed in one place, by the page.
 */

type Titles = {
  audience_title: string
  process_title: string
  pricing_title: string
}

type Props = {
  lang: Locale
  detail: ServiceDetail
  dict: Titles
  /** Computed by the page, in document order. One entry per extra section. */
  clauses: { audience: string; process: string; pricing: string; sections: string[] }
}

export default function ServiceDetailBody({ lang, detail, dict, clauses }: Props) {
  return (
    <>
      {/* ── Who it is for ──────────────────────────────────────────────────
          The "is this me" test. A service page that only describes the
          service makes the reader do this work themselves, and a reader who
          is not sure the page is about them leaves rather than asks. */}
      <section className="section" aria-labelledby="service-audience">
        <div className="mx-auto max-w-3xl">
          <h2 id="service-audience" className="text-brand-ink">
            <span className="clause" aria-hidden="true">
              {clauses.audience}
            </span>
            {dict.audience_title}
          </h2>
          <ul className="mt-8 flex flex-col gap-4">
            {detail.audience.map((item) => (
              <li key={item[lang]} className="body-text flex items-start gap-2.5">
                <Check
                  className="mt-1 h-4 w-4 flex-shrink-0 text-brand-accent"
                  aria-hidden="true"
                />
                {/* min-w-0 + anywhere: these lines carry Latin product names
                    (Wix, Base44, ODOO, API) and at 320px with 200% text an
                    unbreakable token sets the flex item's min-content width.
                    This project's most recurring defect. */}
                <span className="min-w-0 [overflow-wrap:anywhere]">{item[lang]}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── The stages ─────────────────────────────────────────────────────
          An ordered list, because the order is the content: "the structure
          is decided before anyone opens a design file" only means anything
          as a position in a sequence. */}
      <section className="section section--band" aria-labelledby="service-process">
        <div className="mx-auto max-w-3xl">
          <h2 id="service-process" className="text-brand-ink">
            <span className="clause" aria-hidden="true">
              {clauses.process}
            </span>
            {dict.process_title}
          </h2>
          <ol className="mt-8 flex flex-col gap-7">
            {detail.process.map((step, index) => (
              <li key={step.label[lang]} className="flex min-w-0 gap-4">
                {/* The mono numeral voice, as on the homepage process section.
                    aria-hidden: an <ol> is already numbered for assistive
                    technology, so reading this out loud says "one" twice. */}
                <span
                  className="num flex-shrink-0 text-[1.125rem] leading-snug"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <h3 className="break-words text-[1.0625rem] font-bold text-brand-ink">
                    {step.label[lang]}
                  </h3>
                  <p className="body-text mt-2 [overflow-wrap:anywhere]">{step.detail[lang]}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── What moves the price ───────────────────────────────────────────
          No number is published here that the site does not already publish
          elsewhere - see the content note at the top of content/serviceDetail.ts.
          The heading is overridable because one page's H2 has to be the query
          itself. */}
      <section className="section" aria-labelledby="service-pricing">
        <div className="mx-auto max-w-3xl">
          <h2 id="service-pricing" className="text-brand-ink">
            <span className="clause" aria-hidden="true">
              {clauses.pricing}
            </span>
            {detail.pricingTitle?.[lang] ?? dict.pricing_title}
          </h2>
          {/* whitespace-pre-line: the ecommerce body carries a paragraph
              break, and without this its two points collapse into one wall. */}
          <p className="body-text mt-4 whitespace-pre-line">{detail.pricingBody[lang]}</p>
          <ul className="mt-8 flex flex-col gap-4">
            {detail.pricingFactors.map((factor) => (
              <li key={factor[lang]} className="body-text flex items-start gap-2.5">
                <Check
                  className="mt-1 h-4 w-4 flex-shrink-0 text-brand-accent"
                  aria-hidden="true"
                />
                <span className="min-w-0 [overflow-wrap:anywhere]">{factor[lang]}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── A query this service has to answer by name ─────────────────────
          Used by one page today. Search Console was showing impressions for a
          phrase the page never said, which is the cheapest kind of ranking to
          improve: the work is already described, in different words. */}
      {(detail.sections ?? []).map((section, index) => (
        <section
          key={section.heading[lang]}
          className="section section--band"
          aria-labelledby={`service-section-${index}`}
        >
          <div className="mx-auto max-w-3xl">
            <h2 id={`service-section-${index}`} className="text-brand-ink">
              <span className="clause" aria-hidden="true">
                {clauses.sections[index]}
              </span>
              {section.heading[lang]}
            </h2>
            <p className="body-text mt-4 whitespace-pre-line">{section.body[lang]}</p>
            {section.items && section.items.length > 0 && (
              <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {section.items.map((item) => (
                  <li key={item[lang]} className="body-text flex items-start gap-2.5">
                    <Check
                      className="mt-1 h-4 w-4 flex-shrink-0 text-brand-accent"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 [overflow-wrap:anywhere]">{item[lang]}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}
    </>
  )
}
