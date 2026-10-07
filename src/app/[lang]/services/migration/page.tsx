import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, MessageCircle } from 'lucide-react'
import { locales, isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { pageMetadata } from '@/lib/pageMetadata'
import { getWhatsAppURL } from '@/lib/whatsapp'
import { mdxPosts } from '@/content/generated/posts'
import { getProjects, projectTitle } from '@/content/projects'
import { siteConfig } from '@/lib/config'
import { serviceSchema, breadcrumbSchema, faqSchema } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import ServiceDetailBody from '@/components/sections/ServiceDetailBody'
import ServiceFaqSection from '@/components/sections/ServiceFaqSection'
import { getServiceDetail } from '@/content/serviceDetail'

/**
 * The migration service.
 *
 * Of the four services the homepage sells, this is the only one whose query
 * set does not collide with it. `בניית אתרים` competes with the homepage's own
 * H1; automation and SEO are supporting services the copy does not lead with.
 * Migration is a distinct problem in distinct language - "my site is slow",
 * "getting off Wix", "the developer disappeared" - and the word `וורדפרס`
 * appeared exactly once in the entire rendered homepage.
 *
 * It is also the only one where the work already exists to put on the page:
 * הגורר 2 and כנפיים לעוף are both rebuilds, 22 and 24 pages. Nothing here is
 * a new claim - the description, the eight outcomes and the stack are the
 * featured service card's own copy, and the ownership section is the FAQ
 * answer that was previously buried in a collapsed accordion at 90% scroll
 * depth on a different page.
 *
 * It takes the same second half as the five pages under `[service]`, from the
 * same `content/serviceDetail.ts` and through the same two components, which
 * is why that file is keyed by slug rather than attached to `servicePages` -
 * this page is not a member of that array and needed the blocks anyway. The
 * one question this page answers that the others do not is whether a
 * migration costs the rankings, and that is its first FAQ entry.
 */

type Props = {
  params: Promise<{ lang: string }>
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = await getDictionary(lang)

  return pageMetadata({
    lang,
    path: 'services/migration',
    title: dict.migration.meta_title,
    description: dict.migration.meta_description,
  })
}

export default async function MigrationPage({ params }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const service = dict.services.items.find((item) => item.id === 'migration')
  if (!service) notFound()

  const detail = getServiceDetail('migration')

  // The FAQ answer about ownership is this service's entire value proposition.
  const ownership = dict.faq.items.find(
    (item) => item.question.includes('קוד') || item.question.toLowerCase().includes('code'),
  )

  // The two rebuilds. Both are `web` projects with a public URL, which is what
  // makes them checkable rather than assertable.
  const proof = getProjects().filter((project) =>
    ['hagorer2', 'cnafim-lauf'].includes(project.slug),
  )

  /*
   * One pass over the whole document, in render order - see the identical
   * note on the `[service]` route for why a counter cannot be handed to the
   * child components instead. The numbers were the literals 01 to 04 here,
   * and four new sections landed in the middle of them.
   */
  const clauses = (() => {
    let n = 0
    const next = () => String(++n).padStart(2, '0')
    return {
      intro: next(),
      outcomes: next(),
      ownership: ownership ? next() : '',
      audience: detail ? next() : '',
      process: detail ? next() : '',
      pricing: detail ? next() : '',
      sections: (detail?.sections ?? []).map(() => next()),
      proof: proof.length > 0 ? next() : '',
      faq: detail && detail.faq.length > 0 ? next() : '',
    }
  })()

  return (
    <>
      <JsonLd
        schema={serviceSchema({
          lang,
          path: 'services/migration',
          name: dict.migration.meta_title,
          description: dict.migration.meta_description,
        })}
      />
      {/* This page's own FAQ. One FAQPage block per page, as elsewhere. */}
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
        /* PROPEL > Services > migration. The hub level was missing here too -
           see the note on the [service] route, which had the same gap. */
        schema={breadcrumbSchema([
          { name: 'PROPEL', url: `${siteConfig.url}/${lang}` },
          { name: dict.nav.services, url: `${siteConfig.url}/${lang}/services` },
          {
            name: dict.migration.h1,
            url: `${siteConfig.url}/${lang}/services/migration`,
          },
        ])}
      />

      <section className="section" aria-labelledby="migration-heading">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-6">
            <span className="clause" aria-hidden="true">
              {clauses.intro}
            </span>
            {service.badge}
          </p>
          <h1 id="migration-heading">{dict.migration.h1}</h1>
          <p className="lead mt-6">{dict.migration.intro}</p>
          <p className="body-text mt-5">{service.description}</p>

          <a
            href={getWhatsAppURL(service.whatsapp_message)}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics="whatsapp:service-migration-page"
            className="btn mt-8 inline-flex"
          >
            <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
            {service.cta_label}
          </a>

          {/* Same addition as the five pages under [service]: the only route
              out of this page used to leave the site. See the note there. */}
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

      <section className="section section--band" aria-labelledby="migration-outcomes">
        <div className="mx-auto max-w-3xl">
          <h2 id="migration-outcomes" className="text-brand-ink">
            <span className="clause" aria-hidden="true">
              {clauses.outcomes}
            </span>
            {dict.migration.outcomes_title}
          </h2>
          <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {service.outcomes.map((outcome) => (
              <li key={outcome} className="flex items-start gap-2.5 body-text">
                <Check
                  className="mt-1 h-4 w-4 flex-shrink-0 text-brand-accent"
                  aria-hidden="true"
                />
                {outcome}
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <p className="mb-3 font-display text-[0.75rem] font-semibold uppercase tracking-[.18em] text-brand-slate">
              {dict.services.stack_label}
            </p>
            <ul aria-label={dict.services.stack_label} className="flex flex-wrap gap-1.5">
              {service.stack.map((tech) => (
                <li key={tech} className="tag" dir="auto">
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {ownership && (
        <section className="section" aria-labelledby="migration-ownership">
          <div className="mx-auto max-w-3xl">
            <h2 id="migration-ownership" className="text-brand-ink">
              <span className="clause" aria-hidden="true">
                {clauses.ownership}
              </span>
              {dict.migration.ownership_title}
            </h2>
            <p className="lead mt-6">{ownership.answer}</p>
          </div>
        </section>
      )}

      {/* Who it is for, the stages, what moves the price. Same component and
          same content module as the five pages under [service]. */}
      {detail && (
        <ServiceDetailBody
          lang={lang}
          detail={detail}
          dict={dict.services}
          clauses={clauses}
        />
      )}

      {proof.length > 0 && (
        <section className="section section--band" aria-labelledby="migration-proof">
          <div className="mx-auto max-w-3xl">
            <h2 id="migration-proof" className="text-brand-ink">
              <span className="clause" aria-hidden="true">
                {clauses.proof}
              </span>
              {dict.migration.proof_title}
            </h2>
            <p className="body-text mt-4">{dict.migration.proof_body}</p>

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
      {/* README-PUBLISHING section 6: the article is this page's argument at
          full length - what three years actually cost, which is the question
          every migration lead is really asking. */}
      {(() => {
        const post = mdxPosts.find((p) => p.slug === 'wordpress-vs-custom-code-true-cost' && !p.draft)
        if (!post) return null
        return (
          <section className="section" aria-labelledby="migration-article">
            <div className="mx-auto max-w-3xl">
              <h2
                id="migration-article"
                className="text-xs font-bold uppercase tracking-[0.2em] text-brand-slate"
              >
                {dict.services.from_blog_title}
              </h2>
              <ul className="mt-6 flex flex-col gap-4">
                <li>
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
              </ul>
            </div>
          </section>
        )
      })()}

      {/* The objections, after the evidence - including the only question a
          migration lead actually hesitates over, which is whether it costs
          them the rankings they already have. */}
      {detail && (
        <ServiceFaqSection
          lang={lang}
          items={detail.faq}
          title={dict.services.faq_title}
          clause={clauses.faq}
        />
      )}

      {/* Up to the hub.

          The five pages under `[service]` were each given this link when the
          hub turned out to have no editorial inbound link from its own
          children. This page was missed, because it is the one service page
          that is not under that route - the same reason its breadcrumb was
          missing the hub level. Measured on the built site: every English
          service page linked the hub except this one. */}
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
