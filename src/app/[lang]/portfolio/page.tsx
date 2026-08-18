import { notFound } from 'next/navigation'
import { locales, isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { pageMetadata } from '@/lib/pageMetadata'
import { getProjects, getUsedCategories } from '@/content/projects'
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

  return (
    <section className="section" aria-labelledby="portfolio-index-heading">
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
