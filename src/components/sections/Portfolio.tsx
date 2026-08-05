import { getProjects, getUsedCategories, type ProjectCategory } from '@/content/projects'
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
  private_project: string
}

type Props = {
  lang: Locale
  dict: PortfolioDict
}

export default function Portfolio({ lang, dict }: Props) {
  const projects = getProjects()

  // Nothing published yet — render nothing rather than an empty shell.
  // Navigation and Footer drop their portfolio links in the same situation.
  if (projects.length === 0) return null

  return (
    <section id="portfolio" aria-labelledby="portfolio-heading" className="section">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center lg:mb-14">
          <h2 id="portfolio-heading" className="text-brand-ink lg:text-[3.25rem] lg:leading-[1.1]">
            {dict.section_title}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-[1.75] text-brand-slate sm:text-[1.0625rem]">
            {dict.section_subtitle}
          </p>
        </div>

        <PortfolioGrid
          lang={lang}
          dict={dict}
          projects={projects}
          categories={getUsedCategories()}
        />
      </div>
    </section>
  )
}
