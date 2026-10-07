import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check } from 'lucide-react'
import { locales, isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { siteConfig } from '@/lib/config'
import { pageMetadata } from '@/lib/pageMetadata'
import { breadcrumbSchema, collectionPageSchema, faqSchema } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import { servicePages } from '@/content/services'
import { getProjects, projectTitle } from '@/content/projects'

/**
 * The services hub.
 *
 * The five service pages existed and were linked from the footer and from
 * nowhere else. A set of leaves with no parent is what "crawled, currently not
 * indexed" looks like from Google's side, and it is also what a visitor hits
 * when they guess `/he/services` - which answered a soft 404 until now.
 *
 * It deliberately does NOT restate the pitch. Every card carries the service's
 * own approved `intro` line from `content/services.ts` and the case studies
 * that back it, so this page adds routing and proof rather than a fourth copy
 * of the same paragraph. The homepage section, the service page and this hub
 * each say something the other two do not.
 *
 * ── Why the expansion is written at hub ALTITUDE ─────────────────────────────
 *
 * The page sat at ~151 words, the thinnest commercial page on the site, and it
 * is the one `scripts/overlap.mjs` watches most closely precisely because
 * expanding a hub is the change that recreates the homepage-versus-portfolio
 * duplication. So none of the three new blocks is a per-service block made
 * generic:
 *
 *   - **How to choose** is a symptom-to-page map. It exists only where all
 *     five are in one place, and it is also five contextual links with the
 *     service name as the anchor text, which the cards alone did not give.
 *   - **What every project includes** is the set of commitments that are
 *     identical across the five. Repeating them on each service page would be
 *     the duplication; stating them once, here, is what a hub is for.
 *   - **How a price is arrived at** is the quoting PROCESS. What moves the
 *     number is per-service and stays on each service page, and the last item
 *     says so and points there.
 *
 * The FAQ is engagement-level - combining services, the smallest project,
 * working alongside existing suppliers - and overlaps neither the homepage FAQ
 * (what it costs, how long it takes, who owns the code) nor any service FAQ.
 */

type Props = {
  params: Promise<{ lang: string }>
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = await getDictionary(lang)

  return pageMetadata({
    lang,
    path: 'services',
    title: dict.services.hub_meta_title,
    description: dict.services.hub_meta_description,
  })
}

export default async function ServicesHub({ params }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const projects = getProjects()

  /*
   * The document's clause numbering, in one pass - the same shape as the two
   * service routes. The eyebrow was the only numbered element on the page.
   */
  const clauses = (() => {
    let n = 0
    const next = () => String(++n).padStart(2, '0')
    return {
      intro: next(),
      choose: next(),
      list: next(),
      included: next(),
      price: next(),
      faq: next(),
    }
  })()

  /*
   * The migration service predates `content/services.ts` and keeps its own
   * route, so it is appended here rather than living in that array. Its copy
   * comes from the dictionary, which is where that page reads it too - one
   * source, not a second copy that can drift.
   */
  const cards = [
    ...servicePages.map((service) => ({
      slug: service.slug,
      title: service.title[lang],
      intro: service.intro[lang],
      proofSlugs: service.proofSlugs,
    })),
    {
      slug: 'migration',
      title: dict.migration.h1,
      intro: dict.migration.intro,
      proofSlugs: [] as string[],
    },
  ]

  return (
    <section className="section" aria-labelledby="services-hub-heading">
      <JsonLd
        schema={collectionPageSchema({
          lang,
          path: 'services',
          name: dict.services.hub_title,
          description: dict.services.hub_subtitle,
          hasPart: cards.map((card) => `${siteConfig.url}/${lang}/services/${card.slug}`),
        })}
      />
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'PROPEL', url: `${siteConfig.url}/${lang}` },
          { name: dict.services.hub_title, url: `${siteConfig.url}/${lang}/services` },
        ])}
      />
      {/* The hub's own FAQ. One FAQPage per page is the limit seo-audit
          enforces; the five service pages each carry their own, about their
          own service, and this one is about the engagement. */}
      <JsonLd schema={faqSchema(dict.services.hub_faq_items)} />

      <div className="mx-auto max-w-7xl">
        <div className="mb-10 lg:mb-14">
          <p className="eyebrow mb-6">
            <span className="clause" aria-hidden="true">
              {clauses.intro}
            </span>
            {dict.services.hub_eyebrow}
          </p>
          <h1 id="services-hub-heading" className="max-w-3xl">
            {dict.services.hub_title}
          </h1>
          <p className="lead mt-5 max-w-2xl">{dict.services.hub_subtitle}</p>
        </div>

        {/* ── Symptom to page ────────────────────────────────────────────
            A reader arrives with "orders are read out loud to the kitchen",
            not with "business automation". Five cards titled by service name
            make them do that translation themselves, and the ones who get it
            wrong land on the page that does not answer them.

            It is also the page's only contextual links to its own children -
            the cards link by title alone, which is a good anchor and gives a
            crawler no sentence around it. */}
        <div className="mb-12 border-y border-brand-line py-8 lg:mb-16">
          <h2 className="text-brand-ink">
            <span className="clause" aria-hidden="true">
              {clauses.choose}
            </span>
            {dict.services.hub_choose_title}
          </h2>
          <p className="body-text mt-4 max-w-2xl">{dict.services.hub_choose_body}</p>
          <ul className="mt-8 flex max-w-3xl flex-col gap-5">
            {dict.services.hub_choose_items.map((item) => {
              const card = cards.find((entry) => entry.slug === item.slug)
              if (!card) return null
              return (
                <li key={item.slug} className="min-w-0">
                  {/* The symptom reads first and the destination second,
                      because the reader is scanning for their own sentence and
                      not for a service name they do not have yet. */}
                  <p className="body-text [overflow-wrap:anywhere]">{item.when}</p>
                  <Link
                    href={`/${lang}/services/${card.slug}`}
                    className="group/pick mt-1.5 inline-flex items-center gap-1.5 py-1 font-semibold text-brand-accent transition-colors duration-300 hover:text-brand-ink"
                  >
                    {card.title}
                    <ArrowRight
                      className="h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover/pick:translate-x-1 rtl:-scale-x-100 rtl:group-hover/pick:-translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        <h2 className="text-brand-ink">
          <span className="clause" aria-hidden="true">
            {clauses.list}
          </span>
          {dict.services.hub_list_title}
        </h2>

        <ul className="mt-8 grid gap-5 sm:gap-6 lg:grid-cols-2">
          {cards.map((card, index) => {
            const proof = projects.filter((project) => card.proofSlugs.includes(project.slug))

            return (
              /* The last card spans the row when the count is odd. Five cards
                 in a two-column grid left the migration service - the one the
                 business most wants WordPress refugees to read - alone in row
                 three with an empty cell beside it, directly above the footer,
                 and it is also the shortest card because it is the only one
                 with no proof list. A full-width band reads as deliberate. */
              <li
                key={card.slug}
                className={`card flex min-w-0 flex-col${
                  index === cards.length - 1 && cards.length % 2 === 1 ? ' lg:col-span-2' : ''
                }`}
              >
                {/*
                  One link per card, and it is the title.
                
                  The card carried a second link at the bottom to the same URL
                  with generic text, so every card cost two tab stops for one
                  destination - five extra on the page - and split its anchor
                  text between the service name and "read more". The title is
                  the better anchor for both a reader and a crawler, so the
                  arrow moved up here and the duplicate went. The proof links
                  below stay: they go somewhere else.
                */}
                <h2 className="text-[1.25rem] font-bold text-brand-ink sm:text-[1.4375rem]">
                  <Link
                    href={`/${lang}/services/${card.slug}`}
                    className="group/card inline-flex items-baseline gap-2 transition-colors duration-300 hover:text-brand-accent"
                  >
                    {card.title}
                    <ArrowRight
                      className="h-4 w-4 flex-shrink-0 self-center text-brand-accent transition-transform duration-300 group-hover/card:translate-x-1 rtl:-scale-x-100 rtl:group-hover/card:-translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </h2>

                <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-brand-slate">
                  {card.intro}
                </p>

                {/* The proof, as links. This is the hub's second job: it is the
                    only place on the site where a service and the work that
                    backs it are one click apart in both directions. */}
                {proof.length > 0 && (
                  <div className="mt-5 border-t border-brand-line pt-4">
                    <p className="font-display text-[0.75rem] font-semibold uppercase tracking-[.18em] text-brand-slate">
                      {dict.services.hub_proof_label}
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                      {proof.map((project) => (
                        <li key={project.slug}>
                          <Link
                            href={`/${lang}/portfolio/${project.slug}`}
                            className="inline-flex items-center py-1.5 text-[0.875rem] font-medium text-brand-slate underline underline-offset-4 transition-colors duration-300 hover:text-brand-ink"
                          >
                            {projectTitle(project, lang)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </li>
            )
          })}
        </ul>

        {/* ── What is the same whichever service it is ───────────────────
            Stated once, here. On each service page this would be five copies
            of one paragraph, which is the duplication the hub exists to
            avoid. */}
        <div className="mt-14 border-t border-brand-line pt-10 lg:mt-20">
          <h2 className="text-brand-ink">
            <span className="clause" aria-hidden="true">
              {clauses.included}
            </span>
            {dict.services.hub_included_title}
          </h2>
          <p className="body-text mt-4 max-w-2xl">{dict.services.hub_included_body}</p>
          <ul className="mt-8 grid max-w-4xl gap-x-10 gap-y-4 sm:grid-cols-2">
            {dict.services.hub_included_items.map((item) => (
              <li key={item} className="body-text flex min-w-0 items-start gap-2.5">
                <Check
                  className="mt-1 h-4 w-4 flex-shrink-0 text-brand-accent"
                  aria-hidden="true"
                />
                <span className="min-w-0 [overflow-wrap:anywhere]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── How a number is reached ────────────────────────────────────
            The PROCESS, not the factors. What moves the price is per service
            and lives on each service page; the last item points there. */}
        <div className="mt-14 border-t border-brand-line pt-10">
          <h2 className="text-brand-ink">
            <span className="clause" aria-hidden="true">
              {clauses.price}
            </span>
            {dict.services.hub_price_title}
          </h2>
          <p className="body-text mt-4 max-w-2xl">{dict.services.hub_price_body}</p>
          <ol className="mt-8 flex max-w-3xl flex-col gap-4">
            {dict.services.hub_price_items.map((item, index) => (
              <li key={item} className="body-text flex min-w-0 gap-4">
                {/* aria-hidden: an <ol> is numbered for assistive technology
                    already, so this would be read out twice. */}
                <span className="num flex-shrink-0" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 [overflow-wrap:anywhere]">{item}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* ── The engagement FAQ ─────────────────────────────────────────
            Visible h3/p, which is what the FAQPage block above declares. The
            questions are about working with us; the homepage FAQ answers what
            a project costs and how long it takes, and each service page
            answers its own. */}
        <div className="mt-14 border-t border-brand-line pt-10">
          <h2 className="text-brand-ink">
            <span className="clause" aria-hidden="true">
              {clauses.faq}
            </span>
            {dict.services.hub_faq_title}
          </h2>
          <div className="mt-8 max-w-3xl divide-y divide-brand-line border-t border-brand-line">
            {dict.services.hub_faq_items.map((item) => (
              <div key={item.question} className="py-6">
                <h3 className="min-w-0 break-words text-[1.0625rem] font-bold text-brand-ink">
                  {item.question}
                </h3>
                <p className="body-text mt-3 [overflow-wrap:anywhere]">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* The honest counterweight to a page that lists five things we sell.

            `/not-a-fit` had one editorial inbound link, from the contact page,
            and the English version is one of the URLs Search Console declines
            to index. A page enumerating what we do is the natural place to say
            what we do not, and it is the same moment in the decision as the
            contact page: someone weighing whether to write at all.

            The label is `contact.fit_link`, the string already approved and
            already used for this link on /contact and in the footer. Nothing
            new is claimed here. */}
        {/* Two ways out of the hub, and both were missing one.

            `/not-a-fit` is the honest counterweight. The contact link beside it
            is the other half: this page's first price step is "the scoping
            call", and the hub was the one commercial page with no route to the
            form in its body - the five pages under it all got one. A link that
            exists only in the header and the footer is a chrome link, which is
            counted separately by `scripts/inlinks.mjs` precisely because it is
            satisfied before any real link exists. */}
        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-brand-line pt-8 lg:mt-16">
          <Link
            href={`/${lang}/contact`}
            className="group/go inline-flex items-center gap-1.5 py-1.5 font-display text-[0.875rem] font-bold uppercase tracking-[.08em] text-brand-accent transition-colors duration-300 hover:text-brand-ink"
          >
            {dict.services.contact_link}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover/go:translate-x-1 rtl:-scale-x-100 rtl:group-hover/go:-translate-x-1"
              aria-hidden="true"
            />
          </Link>
          <Link
            href={`/${lang}/not-a-fit`}
            className="group/fit inline-flex items-center gap-1.5 py-1.5 font-display text-[0.875rem] font-bold uppercase tracking-[.08em] text-brand-slate transition-colors duration-300 hover:text-brand-ink"
          >
            {dict.contact.fit_link}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover/fit:translate-x-1 rtl:-scale-x-100 rtl:group-hover/fit:-translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
