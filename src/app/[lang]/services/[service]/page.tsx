import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Check, MessageCircle, ArrowUpRight } from 'lucide-react'
import { locales, isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { siteConfig } from '@/lib/config'
import { pageMetadata } from '@/lib/pageMetadata'
import { getWhatsAppURL } from '@/lib/whatsapp'
import { serviceSchema, breadcrumbSchema } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import { getProjects, projectTitle } from '@/content/projects'
import { getServicePage, getServiceSlugs } from '@/content/services'

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

  return (
    <>
      <JsonLd
        schema={serviceSchema({
          lang,
          path: `services/${service.slug}`,
          name: service.title[lang],
          description: service.metaDescription[lang],
        })}
      />
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'PROPEL', url: `${siteConfig.url}/${lang}` },
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
              01
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
        </div>
      </section>

      <section className="section section--band" aria-labelledby="service-outcomes">
        <div className="mx-auto max-w-3xl">
          <h2 id="service-outcomes" className="text-brand-ink">
            <span className="clause" aria-hidden="true">
              02
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

      {proof.length > 0 && (
        <section className="section" aria-labelledby="service-proof">
          <div className="mx-auto max-w-3xl">
            <h2 id="service-proof" className="text-brand-ink">
              <span className="clause" aria-hidden="true">
                03
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
                    <ArrowUpRight
                      className="h-4 w-4 flex-shrink-0 -rotate-90 text-brand-accent rtl:-scale-x-100"
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
    </>
  )
}
