import { notFound } from 'next/navigation'
import { locales, isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { pageMetadata } from '@/lib/pageMetadata'
import { getProjects, getUsedCategories } from '@/content/projects'
import { collectionPageSchema } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import PortfolioGrid from '@/components/sections/PortfolioGrid'

/**
 * The portfolio index.
 *
 * `/he/portfolio` returned 404 - the most guessable URL on the site, and the
 * one every case study's own breadcrumb pointed at. Position 2 of the
 * BreadcrumbList was `/he#portfolio`: a fragment on another page, so the
 * structured data described a hierarchy that did not exist.
 *
 * It also gives the five case studies a parent. Before this they were reachable
 * only from the homepage grid, the blog block and a single next-project link,
 * which is a flat set of leaves with no hub.
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
    path: 'portfolio',
    title: dict.portfolio.index_meta_title,
    description: dict.portfolio.index_meta_description,
  })
}

export default async function PortfolioIndex({ params }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const projects = getProjects()
  // Facts about the content file, not typed numbers that can go stale.
  const fields = new Set(projects.map((project) => project.category)).size
  const publicSites = projects.filter((project) => project.liveUrl).length

  return (
    <section className="section" aria-labelledby="portfolio-index-heading">
      <JsonLd
        schema={collectionPageSchema({
          lang,
          path: 'portfolio',
          name: dict.portfolio.index_title,
          description: dict.portfolio.index_subtitle,
        })}
      />
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 lg:mb-14">
          <p className="eyebrow mb-6">
            <span className="clause" aria-hidden="true">
              01
            </span>
            {dict.portfolio.eyebrow}
          </p>
          <h1 id="portfolio-index-heading" className="max-w-3xl">
            {dict.portfolio.index_title}
          </h1>
          <p className="lead mt-5 max-w-2xl">{dict.portfolio.index_subtitle}</p>
        </div>

        {/* The cards are <h3> because on the homepage the grid sits under an
            <h2> section heading. Here the only heading above them is the <h1>,
            which made the outline skip a level on exactly this route - found
            only when the headings audit was widened, because it never looked
            at /portfolio. One hidden <h2> restores the outline without
            renumbering a component that is correct where it lives. */}
        {/*
          The index's own content.

          The homepage grid and this page rendered the same five cards over the
          same copy: an 8-gram comparison of the two `<main>` elements put them
          at 89.7% identical, the highest overlap on the site and a fair
          description of why Search Console lists both /he/portfolio and
          /en/portfolio as "crawled, currently not indexed". The homepage shows
          three now; this page shows all five and says something the homepage
          does not - how the case studies are written, and why a missing number
          is missing.

          The counts are facts about the content file, computed rather than
          typed, so they cannot go stale when a project is published.
        */}
        <div className="mb-12 grid gap-8 border-y border-brand-line py-8 lg:mb-16 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div>
            <h2 className="text-[1.25rem] font-bold text-brand-ink">
              {dict.portfolio.index_lead_title}
            </h2>
            <p className="body-text mt-3 max-w-2xl">{dict.portfolio.index_lead_body}</p>
          </div>
          <dl className="grid grid-cols-3 gap-4 self-center">
            {[
              { value: projects.length, label: dict.portfolio.index_stat_projects },
              { value: fields, label: dict.portfolio.index_stat_fields },
              { value: publicSites, label: dict.portfolio.index_stat_public },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="num block text-[2.25rem] leading-none">{stat.value}</span>
                  <span className="mt-2 block text-[0.75rem] leading-snug text-brand-slate">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <h2 className="sr-only">{dict.portfolio.index_title}</h2>
        <PortfolioGrid
          lang={lang}
          dict={dict.portfolio}
          projects={projects}
          categories={getUsedCategories()}
        />
      </div>
    </section>
  )
}
