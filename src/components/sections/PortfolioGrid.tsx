'use client'

import { useState } from 'react'
import Link from 'next/link'
import ProjectScreens from '@/components/ProjectScreens'
import FilterChips from '@/components/FilterChips'
import { MessageCircle } from 'lucide-react'
import PrivateProjectShowcase from '@/components/PrivateProjectShowcase'
import { getWhatsAppURL } from '@/lib/whatsapp'
import type { Locale } from '@/lib/i18n'
import { projectTitle, type Project, type ProjectCategory } from '@/content/projects'

type PortfolioDict = {
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
  filter_label: string
  filter_status: string
  filter_status_one: string
  private_project: string
  showcase_label: string
  showcase_prev: string
  showcase_next: string
}

type Props = {
  lang: Locale
  dict: PortfolioDict
  projects: Project[]
  categories: ProjectCategory[]
}

const cardBase =
  'group flex min-w-0 flex-col overflow-hidden border border-brand-line bg-brand-panel transition-all duration-500 ease-smooth hover:-translate-y-2 focus-within:-translate-y-2'

const tagBase =
  'rounded-full border border-brand-line bg-brand-surface px-2.5 py-0.5 text-[0.75rem] font-medium tracking-wide text-brand-slate'

export default function PortfolioGrid({ lang, dict, projects, categories }: Props) {
  const [active, setActive] = useState<ProjectCategory | 'all'>('all')

  const visible = active === 'all' ? projects : projects.filter((p) => p.category === active)

  return (
    <>
      {/* Category filter - only worth showing once there is more than one category */}
      {categories.length > 1 && (
        <FilterChips
          label={dict.filter_label}
          status={
            visible.length === 1
              ? dict.filter_status_one
              : dict.filter_status.replace('{n}', String(visible.length))
          }
          active={active}
          onChange={setActive}
          options={[
            { value: 'all' as const, label: dict.all_label },
            ...categories.map((category) => ({
              value: category,
              label: dict.categories[category],
            })),
          ]}
        />
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {visible.map((project) => {
          const waMessage = `${dict.whatsapp_prefix} "${projectTitle(project, lang)}" ${dict.whatsapp_suffix}`
          // Safe to read directly: `getProjects` strips every pending metric
          // before a project reaches here. Filtering again in this component
          // would ship the predicate - and the string `TODO(metric)` with it -
          // into the client bundle, which is exactly how it leaked before.
          const headline = project.results?.[0]

          return (
            <article
              key={project.slug}
              // Without a name, an element list gives "article, article,
              // article" and the cards cannot be navigated to.
              aria-labelledby={`project-${project.slug}`}
              className={cardBase}
            >
              {/* Device previews - the site scrolls inside the frames on hover,
                  or on entering the viewport where there is no hover.

                  Only where there is something to show. Air Manage and BOM sit
                  behind a login, so they have no capture, and the frame used to
                  render as an empty 330px box with a 2px ink border - two blank
                  screens in the section that exists to prove the work. */}
              <div className="relative bg-brand-surface px-4 pb-4 pt-6">
                {project.screens ? (
                  <ProjectScreens
                    desktop={project.screens.desktop}
                    mobile={project.screens.mobile}
                    title={`${projectTitle(project, lang)} - ${dict.categories[project.category]}`}
                  />
                ) : (
                  /* Behind a login: shows the owner's recordings once they
                     exist, and the honest lock placeholder until then. */
                  <PrivateProjectShowcase
                    media={project.media}
                    lang={lang}
                    placeholderLabel={dict.private_project}
                    ariaLabel={dict.showcase_label}
                    prevLabel={dict.showcase_prev}
                    nextLabel={dict.showcase_next}
                  />
                )}

                {/* Category chip */}
                <span className="absolute start-4 top-4 z-10 border border-brand-line bg-brand-panel px-3 py-1 font-display text-[0.75rem] font-semibold uppercase tracking-[.06em] text-brand-ink">
                  {dict.categories[project.category]}
                </span>
              </div>

              {/* Content */}
              <div className="flex min-w-0 flex-1 flex-col p-6 sm:p-7">
                {/*
                  The number leads.
                  
                  It was 26px, below the summary and above the tech tags -
                  third in a card whose entire job is proof. First, and at
                  56px, it is the thing the eye lands on. Latin digits render
                  in Chakra Petch even on the Hebrew page, so this is also the
                  one place the technical letterforms show on /he.
                */}
                {headline && (
                  <div className="mb-3 flex items-baseline gap-2">
                    <span className="num text-[3.5rem] leading-[0.85]">{headline.metric}</span>
                    <span className="text-[0.75rem] leading-snug text-brand-slate">
                      {headline.label[lang]}
                    </span>
                  </div>
                )}

                <h3
                  id={`project-${project.slug}`}
                  className="mb-2 break-words text-[1rem] font-bold text-brand-ink"
                >
                  {projectTitle(project, lang)}
                </h3>

                <p className="mb-5 flex-1 text-[0.875rem] leading-relaxed text-brand-slate">
                  {project.summary[lang]}
                </p>

                {project.techStack.length > 0 && (
                  /* A list, not a div of spans - otherwise it is announced as
                     "Next.js React TypeScript Tailwind" in one breath with no
                     boundary between the items. */
                  <ul aria-label={dict.stack_label} className="mb-5 flex flex-wrap gap-1.5">
                    {project.techStack.map((tag) => (
                      <li key={tag} className={tagBase}>
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href={`/${lang}/portfolio/${project.slug}`}
                    className="text-[0.875rem] font-semibold tracking-wide text-brand-ink underline-offset-2 transition-colors duration-200 hover:text-brand-slate hover:underline"
                  >
                    {dict.view_project}
                    <span className="sr-only"> - {projectTitle(project, lang)}</span>
                  </Link>
                  <a
                    href={getWhatsAppURL(waMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-analytics={`whatsapp:project-${project.slug}`}
                    className="flex items-center gap-1.5 text-[0.875rem] text-brand-slate transition-colors duration-200 hover:text-brand-ink"
                  >
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    WhatsApp
                    <span className="sr-only"> - {projectTitle(project, lang)}</span>
                  </a>
                </div>
              </div>
            </article>
          )
        })}

        {/*
         * Five projects in a three-column grid leave one cell empty - a
         * card-height hole, the largest single gap on the page. Rather than
         * stretching the last row to hide it, the cell carries the invitation
         * that the whole section is building towards. Six items, two full rows.
         */}
        {/* justify-center + the default stretch, not self-start: the card is
            ~156px of content in a ~500px row, and pinned to the top it left a
            278px void below itself - the second defect this cell has produced. */}
        <article className="flex flex-col items-center justify-center border border-brand-accent bg-brand-panel p-8 text-center">
          <h3 className="text-brand-accent">{dict.cta_title}</h3>
          <p className="mt-3 text-[0.875rem] leading-relaxed text-brand-slate">{dict.cta_body}</p>
          <a
            href={getWhatsAppURL(dict.cta_whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics="whatsapp:portfolio-cta"
            className="btn mx-auto mt-6"
          >
            <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
            {dict.cta_button}
          </a>
        </article>
      </div>
    </>
  )
}
