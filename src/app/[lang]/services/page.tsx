import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { locales, isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { siteConfig } from '@/lib/config'
import { pageMetadata } from '@/lib/pageMetadata'
import { breadcrumbSchema, collectionPageSchema } from '@/lib/schema'
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

      <div className="mx-auto max-w-7xl">
        <div className="mb-10 lg:mb-14">
          <p className="eyebrow mb-6">
            <span className="clause" aria-hidden="true">
              01
            </span>
            {dict.services.hub_eyebrow}
          </p>
          <h1 id="services-hub-heading" className="max-w-3xl">
            {dict.services.hub_title}
          </h1>
          <p className="lead mt-5 max-w-2xl">{dict.services.hub_subtitle}</p>
        </div>

        <ul className="grid gap-5 sm:gap-6 lg:grid-cols-2">
          {cards.map((card) => {
            const proof = projects.filter((project) => card.proofSlugs.includes(project.slug))

            return (
              <li key={card.slug} className="card flex min-w-0 flex-col">
                <h2 className="text-[1.25rem] font-bold text-brand-ink sm:text-[1.4375rem]">
                  <Link
                    href={`/${lang}/services/${card.slug}`}
                    className="transition-colors duration-300 hover:text-brand-accent"
                  >
                    {card.title}
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

                <Link
                  href={`/${lang}/services/${card.slug}`}
                  className="group/cta mt-5 inline-flex items-center gap-1.5 self-start py-1.5 font-display text-[0.875rem] font-bold uppercase tracking-[.08em] text-brand-accent transition-colors duration-300 hover:text-brand-ink"
                >
                  {dict.services.read_more}
                  <span className="sr-only"> - {card.title}</span>
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1 rtl:-scale-x-100 rtl:group-hover/cta:-translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
