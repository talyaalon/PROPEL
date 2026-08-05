'use client'

import { useState } from 'react'
import Link from 'next/link'
import ProjectScreens from '@/components/ProjectScreens'
import { MessageCircle } from 'lucide-react'
import { getWhatsAppURL } from '@/lib/whatsapp'
import type { Locale } from '@/lib/i18n'
import type { Project, ProjectCategory } from '@/content/projects'

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
}

type Props = {
  lang: Locale
  dict: PortfolioDict
  projects: Project[]
  categories: ProjectCategory[]
}

const cardBase =
  'group flex flex-col overflow-hidden border border-brand-line bg-brand-panel transition-all duration-500 ease-smooth hover:-translate-y-2  focus-within:-translate-y-2 focus-within:'

const tagBase =
  'rounded-full border border-brand-line bg-brand-surface px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-brand-slate'

export default function PortfolioGrid({ lang, dict, projects, categories }: Props) {
  const [active, setActive] = useState<ProjectCategory | 'all'>('all')

  const visible = active === 'all' ? projects : projects.filter((p) => p.category === active)

  return (
    <>
      {/* Category filter - only worth showing once there is more than one category */}
      {categories.length > 1 && (
        <div className="mb-10 flex flex-wrap justify-center gap-2" role="group">
          <FilterChip
            label={dict.all_label}
            isActive={active === 'all'}
            onClick={() => setActive('all')}
          />
          {categories.map((category) => (
            <FilterChip
              key={category}
              label={dict.categories[category]}
              isActive={active === category}
              onClick={() => setActive(category)}
            />
          ))}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {visible.map((project) => {
          const waMessage = `${dict.whatsapp_prefix} "${project.title}" ${dict.whatsapp_suffix}`
          const headline = project.results?.[0]

          return (
            <article key={project.slug} className={cardBase}>
              {/* Device previews - the site scrolls inside the frames on hover,
                  or on entering the viewport where there is no hover. */}
              <div className="relative bg-brand-surface px-4 pb-4 pt-6">
                <ProjectScreens
                  desktop={project.screens?.desktop}
                  mobile={project.screens?.mobile}
                  title={`${project.title} - ${dict.categories[project.category]}`}
                />

                {/* Category chip */}
                <span className="absolute start-4 top-4 z-10 border border-brand-line bg-brand-panel px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-[.06em] text-brand-ink">
                  {dict.categories[project.category]}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <h3 className="mb-2 text-[16px] font-bold text-brand-ink">{project.title}</h3>

                <p className="mb-5 flex-1 text-[14px] leading-relaxed text-brand-slate">
                  {project.summary[lang]}
                </p>

                {/* Headline result - the single most persuasive thing on the card */}
                {headline && (
                  <div className="mb-5 flex items-baseline gap-2 border-t border-brand-line pt-4">
                    <span className="num text-[26px] leading-none">{headline.metric}</span>
                    <span className="text-[12px] leading-snug text-brand-slate">
                      {headline.label[lang]}
                    </span>
                  </div>
                )}

                {project.techStack.length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-1.5">
                    {project.techStack.map((tag) => (
                      <span key={tag} className={tagBase}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href={`/${lang}/portfolio/${project.slug}`}
                    className="text-[13px] font-semibold tracking-wide text-brand-ink underline-offset-2 transition-colors duration-200 hover:text-brand-slate hover:underline"
                  >
                    {dict.view_project}
                    <span className="sr-only"> - {project.title}</span>
                  </Link>
                  <a
                    href={getWhatsAppURL(waMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-analytics={`whatsapp:project-${project.slug}`}
                    className="flex items-center gap-1.5 text-[13px] text-brand-slate transition-colors duration-200 hover:text-brand-ink"
                  >
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    WhatsApp
                    <span className="sr-only"> - {project.title}</span>
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
        <article className="flex flex-col justify-center border border-brand-accent/40 bg-brand-panel p-8 text-center">
          <h3 className="text-brand-accent">{dict.cta_title}</h3>
          <p className="mt-3 text-[14px] leading-relaxed text-brand-slate">{dict.cta_body}</p>
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

function FilterChip({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`rounded-full border px-4 py-2 text-[13px] font-medium tracking-wide transition-all duration-300 ${
        isActive
          ? 'border-brand-accent bg-brand-accent text-brand-surface'
          : 'border-brand-line bg-brand-panel text-brand-slate hover:border-brand-slate hover:text-brand-ink'
      }`}
    >
      {label}
    </button>
  )
}
