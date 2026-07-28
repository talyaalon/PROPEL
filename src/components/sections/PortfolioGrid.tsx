'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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
}

type Props = {
  lang: Locale
  dict: PortfolioDict
  projects: Project[]
  categories: ProjectCategory[]
}

const cardBase =
  'group flex flex-col overflow-hidden border border-brand-ink/15 bg-brand-deep transition-all duration-500 ease-smooth hover:-translate-y-2  focus-within:-translate-y-2 focus-within:'

const tagBase =
  'rounded-full border border-brand-ink/15 bg-brand-void px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-brand-muted'

export default function PortfolioGrid({ lang, dict, projects, categories }: Props) {
  const [active, setActive] = useState<ProjectCategory | 'all'>('all')

  const visible = active === 'all' ? projects : projects.filter((p) => p.category === active)

  return (
    <>
      {/* Category filter — only worth showing once there is more than one category */}
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
              {/* Thumbnail */}
              <div className="relative h-48 w-full overflow-hidden bg-brand-void sm:h-52">
                {project.thumbnail?.src ? (
                  <Image
                    src={project.thumbnail.src}
                    alt={project.thumbnail.alt[lang]}
                    fill
                    className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.04]"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                ) : (
                  <span
                    className="absolute bottom-3 end-4 select-none font-display text-[80px] font-black leading-none text-black/[0.05]"
                    aria-hidden="true"
                  >
                    {project.title.charAt(0)}
                  </span>
                )}

                {/* Category chip */}
                <span className="absolute start-4 top-4 rounded-full border border-brand-ink/15 bg-brand-deep/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-brand-ink backdrop-blur-sm">
                  {dict.categories[project.category]}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <h3 className="mb-2 text-[16px] font-bold text-brand-ink">{project.title}</h3>

                <p className="mb-5 flex-1 text-[14px] leading-relaxed text-brand-muted">
                  {project.summary[lang]}
                </p>

                {/* Headline result — the single most persuasive thing on the card */}
                {headline && (
                  <div className="mb-5 flex items-baseline gap-2 border-t border-brand-ink/15 pt-4">
                    <span className="num text-[26px] leading-none">{headline.metric}</span>
                    <span className="text-[12px] leading-snug text-brand-muted">
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
                    className="text-[13px] font-semibold tracking-wide text-brand-ink underline-offset-2 transition-colors duration-200 hover:text-brand-muted hover:underline"
                  >
                    {dict.view_project}
                    <span className="sr-only"> — {project.title}</span>
                  </Link>
                  <a
                    href={getWhatsAppURL(waMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-analytics={`whatsapp:project-${project.slug}`}
                    className="flex items-center gap-1.5 text-[13px] text-brand-muted transition-colors duration-200 hover:text-brand-ink"
                  >
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    WhatsApp
                    <span className="sr-only"> — {project.title}</span>
                  </a>
                </div>
              </div>
            </article>
          )
        })}
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
          ? 'border-brand-accent bg-brand-accent text-brand-deep'
          : 'border-brand-ink/15 bg-brand-deep text-brand-muted hover:border-brand-muted hover:text-brand-ink'
      }`}
    >
      {label}
    </button>
  )
}
