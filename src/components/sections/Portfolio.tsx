import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getProjects, type ProjectCategory } from '@/content/projects'
import type { Locale } from '@/lib/i18n'
import PortfolioGrid from './PortfolioGrid'

type PortfolioDict = {
  section_title: string
  section_subtitle: string
  view_project: string
  all_label: string
  categories: Record<ProjectCategory, string>
  whatsapp_prefix: string
  whatsapp_suffix: string
  cta_title: string
  cta_body: string
  cta_button: string
  cta_whatsapp: string
  stack_label: string
  eyebrow: string
  view_all: string
  filter_label: string
  filter_status: string
  filter_status_one: string
  private_project: string
  showcase_label: string
  showcase_prev: string
  showcase_next: string
}

type Props = {
  /** Section clause number, computed by the page. */
  clause?: string
  lang: Locale
  dict: PortfolioDict
}

/**
 * How many case studies the homepage shows before handing off to the index.
 *
 * Three, not all five, and the reason is measured. The homepage and
 * /he/portfolio rendered the same grid over the same five projects: an 8-gram
 * shingle comparison of the two `<main>` elements put them at 89.7% identical,
 * which is the highest overlap anywhere on the site and a fair description of
 * why Search Console lists /he/portfolio and /en/portfolio as "crawled,
 * currently not indexed". A page that repeats another page has to earn its
 * place, and the index earns it by being the only page with the full set.
 *
 * Three is also what the grid wants: the homepage row is `lg:grid-cols-3`, so
 * five projects left a hole that the CTA card was invented to fill. Three
 * projects plus that card is two clean rows.
 */
const HOMEPAGE_LIMIT = 3

export default function Portfolio({ lang, dict, clause }: Props) {
  const published = getProjects()
  // `getProjects` sorts featured first, so this is the three the owner chose.
  const projects = published.slice(0, HOMEPAGE_LIMIT)

  // Nothing published yet - render nothing rather than an empty shell.
  // Navigation and Footer drop their portfolio links in the same situation.
  if (projects.length === 0) return null

  return (
    <section id="portfolio" aria-labelledby="portfolio-heading" className="section relative">
      {/* Document furniture, like the hero's: the clause and the section's
          own eyebrow. The derived "5 · 3" that stood here was two numbers
          with no referent - precision theatre, exactly what the design doc
          forbids. */}
      <span className="draft-annotation" aria-hidden="true">
        <span className="draft-annotation__text">03 - {dict.eyebrow}</span>
      </span>

      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col items-center text-center lg:mb-14">
          <p className="eyebrow mb-6">
            {clause && (
              <span className="clause" aria-hidden="true">
                {clause}
              </span>
            )}
            {dict.eyebrow}
          </p>
          <h2 id="portfolio-heading" className="text-brand-ink lg:text-[3.25rem] lg:leading-[1.1]">
            {dict.section_title}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-[1.75] text-brand-slate sm:text-[1.1875rem]">
            {dict.section_subtitle}
          </p>
        </div>

        {/* No category chips here. They filter a set of three, two of which
            share a category - a control that cannot change what you see. The
            index has all five and keeps them. */}
        <PortfolioGrid lang={lang} dict={dict} projects={projects} categories={[]} />

        {/* The route to the portfolio index. Without it the hub had no inbound
            link from the page that every visitor lands on first, and the grid
            above was the end of the road rather than a way into it. */}
        <div className="mt-10 flex justify-center lg:mt-14">
          <Link
            href={`/${lang}/portfolio`}
            className="group/all inline-flex items-center gap-2 py-1.5 font-display text-[0.875rem] font-bold uppercase tracking-[.08em] text-brand-accent transition-colors duration-300 hover:text-brand-ink"
          >
            {dict.view_all}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover/all:translate-x-1 rtl:-scale-x-100 rtl:group-hover/all:-translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
