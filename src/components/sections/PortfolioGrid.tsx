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
  'group flex flex-col overflow-hidden rounded-[24px] border border-brand-border bg-white shadow-soft transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-2 hover:shadow-card-hover focus-within:-translate-y-2 focus-within:shadow-card-hover sm:rounded-[28px]'

const tagBase =
  'rounded-full border border-brand-border bg-brand-cream px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-brand-steel'

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
          const headline = project.results[0]

          return (
            <article key={project.slug} className={cardBase}>
              {/* Thumbnail */}
              <div className="relative h-48 w-full overflow-hidden bg-brand-cream sm:h-52">
                {project.thumbnail.src ? (
                  <Image
                    src={project.thumbnail.src}
                    alt={project.thumbnail.alt[lang]}
                    fill
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.04]"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                ) : (
                  <span
                    className="absolute bottom-3 end-4 select-none font-raleway text-[80px] font-black leading-none text-black/[0.05]"
                    aria-hidden="true"
                  >
                    {project.title.charAt(0)}
                  </span>
                )}

                {/* Category chip */}
                <span className="absolute start-4 top-4 rounded-full border border-brand-border bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-brand-charcoal backdrop-blur-sm">
                  {dict.categories[project.category]}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <h3 className="mb-2 text-[16px] font-bold tracking-[-0.01em] text-brand-charcoal">
                  {project.title}
                </h3>

                <p className="mb-5 flex-1 text-[14px] leading-relaxed text-brand-steel">
                  {project.summary[lang]}
                </p>

                {/* Headline result — the single most persuasive thing on the card */}
                {headline && (
                  <div className="mb-5 flex items-baseline gap-2 border-t border-brand-border pt-4">
                    <span className="font-raleway text-[26px] font-black leading-none tracking-tight text-brand-charcoal">
                      {headline.metric}
                    </span>
                    <span className="text-[12px] leading-snug text-brand-steel">
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
                    className="text-[13px] font-semibold tracking-wide text-brand-charcoal underline-offset-2 transition-colors duration-200 hover:text-brand-steel hover:underline"
                  >
                    {dict.view_project}
                    <span className="sr-only"> — {project.title}</span>
                  </Link>
                  <a
                    href={getWhatsAppURL(waMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-analytics={`whatsapp:project-${project.slug}`}
                    className="flex items-center gap-1.5 text-[13px] text-brand-steel transition-colors duration-200 hover:text-brand-charcoal"
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
          ? 'border-brand-black bg-brand-black text-white'
          : 'border-brand-border bg-white text-brand-steel hover:border-brand-steel hover:text-brand-charcoal'
      }`}
    >
      {label}
    </button>
  )
}
