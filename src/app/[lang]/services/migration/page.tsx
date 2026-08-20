import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, MessageCircle } from 'lucide-react'
import { locales, isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { pageMetadata } from '@/lib/pageMetadata'
import { getWhatsAppURL } from '@/lib/whatsapp'
import { getProjects, projectTitle } from '@/content/projects'
import { siteConfig } from '@/lib/config'
import { serviceSchema, breadcrumbSchema } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'

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

  // The FAQ answer about ownership is this service's entire value proposition.
  const ownership = dict.faq.items.find(
    (item) => item.question.includes('קוד') || item.question.toLowerCase().includes('code'),
  )

  // The two rebuilds. Both are `web` projects with a public URL, which is what
  // makes them checkable rather than assertable.
  const proof = getProjects().filter((project) =>
    ['hagorer2', 'cnafim-lauf'].includes(project.slug),
  )

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
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'PROPEL', url: `${siteConfig.url}/${lang}` },
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
              01
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
        </div>
      </section>

      <section className="section section--band" aria-labelledby="migration-outcomes">
        <div className="mx-auto max-w-3xl">
          <h2 id="migration-outcomes" className="text-brand-ink">
            <span className="clause" aria-hidden="true">
              02
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
                <li key={tech} className="tag">
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
                03
              </span>
              {dict.migration.ownership_title}
            </h2>
            <p className="lead mt-6">{ownership.answer}</p>
          </div>
        </section>
      )}

      {proof.length > 0 && (
        <section className="section section--band" aria-labelledby="migration-proof">
          <div className="mx-auto max-w-3xl">
            <h2 id="migration-proof" className="text-brand-ink">
              <span className="clause" aria-hidden="true">
                04
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
    </>
  )
}
