import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, MessageCircle } from 'lucide-react'
import { locales, isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { siteConfig } from '@/lib/config'
import { pageMetadata } from '@/lib/pageMetadata'
import { getWhatsAppURL } from '@/lib/whatsapp'
import { serviceSchema, breadcrumbSchema, faqSchema } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import ServiceDetailBody from '@/components/sections/ServiceDetailBody'
import ServiceFaqSection from '@/components/sections/ServiceFaqSection'
import { getProjects, projectTitle } from '@/content/projects'
import { mdxPosts } from '@/content/generated/posts'
import { showDrafts } from '@/content/articles'
import { getServicePage, getServiceSlugs } from '@/content/services'
import { getServiceDetail } from '@/content/serviceDetail'

/**
 * A dedicated page per money query.
 *
 * The live-site audit found the homepage title-targeting two services at once
 * while "מערכות ניהול לעסק" and "בניית חנות אונליין" had zero occurrences
 * anywhere - though the portfolio holds shipped work for both. One page
 * cannot rank for four services; these carry one query each, in the title
 * and the H1, standing on the case studies as proof.
 *
 * The migration page keeps its own route: it predates these, its copy is
 * structured differently (ownership section from the FAQ), and its URL is
 * already indexed.
 *
 * ── The second half of the page ──────────────────────────────────────────────
 *
 * The five pages ran to 150-275 Hebrew words. That is a page which states a
 * claim and offers no way to evaluate it: a reader could not tell whether the
 * service was for them, what the work would involve, or what would move the
 * price - and Google had almost nothing to match a long-tail query against.
 *
 * Four blocks now come from `content/serviceDetail.ts` and render through
 * `ServiceDetailBody`: who it is for, the stages, what moves the price, and
 * an extra H2 where one service needs to answer a query by name. The FAQ
 * follows the case-study proof, so objections come after evidence, and it is
 * declared once as a `FAQPage` - `scripts/seo-audit.mjs` fails a page
 * carrying two.
 *
 * Clause numbers are generated rather than written in, for the reason the
 * case-study route generates its own: they used to be the literals 01, 02 and
 * 03, and inserting a section in the middle of a hand-numbered document
 * renumbers everything after it by hand or stops being a document.
 */

type Props = {
  params: Promise<{ lang: string; service: string }>
}

// Unknown service slugs are 404s at build time, not runtime renders.
export const dynamicParams = false

export function generateStaticParams() {
  return locales.flatMap((lang) => getServiceSlugs().map((service) => ({ lang, service })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, service: slug } = await params
  if (!isLocale(lang)) return {}
  const service = getServicePage(slug)
  if (!service) return {}

  return pageMetadata({
    lang,
    path: `services/${service.slug}`,
    // metaTitle carries the full SERP line; pageMetadata appends nothing.
    title: service.metaTitle[lang].replace(' | PROPEL', ''),
    description: service.metaDescription[lang],
  })
}

export default async function ServicePage({ params }: Props) {
  const { lang, service: slug } = await params
  if (!isLocale(lang)) notFound()

  const service = getServicePage(slug)
  if (!service) notFound()

  const dict = await getDictionary(lang)
  const proof = getProjects().filter((project) => service.proofSlugs.includes(project.slug))
  const detail = getServiceDetail(service.slug)

  /*
   * The whole document's clause numbering, computed in one pass.
   *
   * It has to live here and not inside the children: a child renders after
   * its parent's JSX is built, so a shared counter handed down as a callback
   * gives the parent's later sections numbers the child is about to reuse.
   * Measured as two sections numbered 03 on all five pages. A section that
   * does not render takes no number, so the sequence has no gaps either.
   */
  const clauses = (() => {
    let n = 0
    const next = () => String(++n).padStart(2, '0')
    return {
      intro: next(),
      outcomes: next(),
      audience: detail ? next() : '',
      process: detail ? next() : '',
      pricing: detail ? next() : '',
      sections: (detail?.sections ?? []).map(() => next()),
      proof: proof.length > 0 ? next() : '',
      faq: detail && detail.faq.length > 0 ? next() : '',
    }
  })()

  // Published articles this service links to. `showDrafts` so a preview deploy
  // - the only place a draft is reviewed - shows its links too.
  const serviceArticles = (service.articles ?? []).flatMap((slug) =>
    mdxPosts.filter((post) => post.slug === slug && (showDrafts || !post.draft)),
  )

  return (
    <>
      <JsonLd
        schema={serviceSchema({
          lang,
          path: `services/${service.slug}`,
          name: service.title[lang],
          description: service.metaDescription[lang],
          // The page's own visible list, not a second description of it.
          offers: service.outcomes.map((outcome) => outcome[lang]),
        })}
      />
      {/* The page's own FAQ, as structured data. Guarded on the resolved
          list, so a service whose detail has not been written yet does not
          ship an empty FAQPage - and every answer is rendered as visible text
          by ServiceFaqSection below. */}
      {detail && detail.faq.length > 0 && (
        <JsonLd
          schema={faqSchema(
            detail.faq.map((item) => ({
              question: item.question[lang],
              answer: item.answer[lang],
            })),
          )}
        />
      )}
      <JsonLd
        /* PROPEL > Services > this service.

           The middle level was missing, so the trail jumped from the homepage
           straight to the leaf and described a two-level site that does not
           exist. It predates `/services`, which did not exist as a page when
           this was written; the case-study trail has always had its hub and is
           the shape copied here. */
        schema={breadcrumbSchema([
          { name: 'PROPEL', url: `${siteConfig.url}/${lang}` },
          { name: dict.nav.services, url: `${siteConfig.url}/${lang}/services` },
          {
            name: service.title[lang],
            url: `${siteConfig.url}/${lang}/services/${service.slug}`,
          },
        ])}
      />

      <section className="section" aria-labelledby="service-heading">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-6">
            <span className="clause" aria-hidden="true">
              {clauses.intro}
            </span>
            {service.eyebrow[lang]}
          </p>
          {/* The H1 IS the query - that is this page's whole reason to exist. */}
          <h1 id="service-heading">{service.title[lang]}</h1>
          <p className="lead mt-6">{service.intro[lang]}</p>
          <p className="body-text mt-5">{service.body[lang]}</p>

          <a
            href={getWhatsAppURL(service.whatsappMessage[lang])}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics={`whatsapp:service-${service.slug}`}
            className="btn mt-8 inline-flex"
          >
            <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
            {dict.hero.cta_primary}
          </a>

          {/* The contact page, from inside the body.
              Every service page offered exactly one way to act - a WhatsApp
              deep link, which leaves the site - so /contact was reachable from
              five commercial pages only through the header and the footer.
              `scripts/inlinks.mjs` counts chrome and editorial links
              separately for precisely this reason: chrome links are satisfied
              before any real link exists. A reader who would rather write than
              open WhatsApp also had nowhere to go. */}
          <p className="mt-5 text-[0.9375rem] text-brand-slate">
            {dict.services.contact_note}{' '}
            <Link
              href={`/${lang}/contact`}
              className="font-semibold text-brand-accent underline underline-offset-4 transition-colors duration-300 hover:text-brand-ink"
            >
              {dict.services.contact_link}
            </Link>
          </p>
        </div>
      </section>

      <section className="section section--band" aria-labelledby="service-outcomes">
        <div className="mx-auto max-w-3xl">
          <h2 id="service-outcomes" className="text-brand-ink">
            <span className="clause" aria-hidden="true">
              {clauses.outcomes}
            </span>
            {service.outcomesTitle[lang]}
          </h2>
          <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {service.outcomes.map((outcome) => (
              <li key={outcome[lang]} className="body-text flex items-start gap-2.5">
                <Check
                  className="mt-1 h-4 w-4 flex-shrink-0 text-brand-accent"
                  aria-hidden="true"
                />
                {outcome[lang]}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who it is for, the stages, what moves the price, and the extra H2
          one service needs. Takes its clause numbers from the counter above,
          so the document stays continuous through the proof section below. */}
      {detail && (
        <ServiceDetailBody
          lang={lang}
          detail={detail}
          dict={dict.services}
          clauses={clauses}
        />
      )}

      {/*
        README-PUBLISHING section 6: the article that makes this service's
        argument at full length. The service page states the claim; the
        article is the evidence a sceptical reader actually wants. The
        generator emits drafts too (`draft: true`); only articles.ts filters
        them, and this reads mdxPosts directly - hence `showDrafts` above.
        Guarded on the RESOLVED list, so a service whose only article is a
        draft does not render this heading over an empty list.
      */}
      {serviceArticles.length > 0 && (
        <section className="section" aria-labelledby="service-articles">
          <div className="mx-auto max-w-3xl">
            <h2
              id="service-articles"
              className="text-xs font-bold uppercase tracking-[0.2em] text-brand-slate"
            >
              {dict.services.from_blog_title}
            </h2>
            <ul className="mt-6 flex flex-col gap-4">
              {serviceArticles.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/${lang}/blog/${post.slug}`}
                    className="card flex flex-wrap items-baseline gap-3 p-5"
                  >
                    <ArrowRight
                      className="h-4 w-4 flex-shrink-0 text-brand-accent rtl:-scale-x-100"
                      aria-hidden="true"
                    />
                    <span className="font-semibold text-brand-ink">{post.title[lang]}</span>
                    <span className="body-text">{post.description[lang]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {proof.length > 0 && (
        <section className="section section--band" aria-labelledby="service-proof">
          <div className="mx-auto max-w-3xl">
            <h2 id="service-proof" className="text-brand-ink">
              <span className="clause" aria-hidden="true">
                {clauses.proof}
              </span>
              {service.proofTitle[lang]}
            </h2>
            <p className="body-text mt-4">{service.proofBody[lang]}</p>

            <ul className="mt-8 flex flex-col gap-4">
              {proof.map((project) => (
                <li key={project.slug}>
                  <Link
                    href={`/${lang}/portfolio/${project.slug}`}
                    className="card flex flex-wrap items-baseline gap-3 p-5"
                  >
                    <ArrowRight
                      className="h-4 w-4 flex-shrink-0 text-brand-accent rtl:-scale-x-100"
                      aria-hidden="true"
                    />
                    <span className="font-semibold text-brand-ink">
                      {projectTitle(project, lang)}
                    </span>
                    <span className="body-text">{project.summary[lang]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* The objections, after the evidence. */}
      {detail && (
        <ServiceFaqSection
          lang={lang}
          items={detail.faq}
          title={dict.services.faq_title}
          clause={clauses.faq}
        />
      )}

      {/* Up to the hub.

          Each service page pointed down to its case studies and sideways to
          the blog, and never up to the page that lists all five services. That
          left the hub with no editorial inbound link from its own children,
          which is the shape `scripts/inlinks.mjs` now fails on. */}
      <section className="section pt-0">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/${lang}/services`}
            className="group/all inline-flex items-center gap-2 py-1.5 font-display text-[0.875rem] font-bold uppercase tracking-[.08em] text-brand-accent transition-colors duration-300 hover:text-brand-ink"
          >
            {dict.services.view_all}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover/all:translate-x-1 rtl:-scale-x-100 rtl:group-hover/all:-translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>
    </>
  )
}
