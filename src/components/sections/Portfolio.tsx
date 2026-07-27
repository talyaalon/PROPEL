import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { getWhatsAppURL } from '@/lib/whatsapp'
import { getAllProjects } from '@/sanity/lib/queries'
import { urlForImage } from '@/sanity/lib/image'

// ─── Dict-driven types (hardcoded fallback) ───────────────────────────────────

type PortfolioItem = {
  id: string
  title: string
  category: string
  description: string
  tags: string[]
  color: string
}

type PortfolioDict = {
  section_title: string
  section_subtitle: string
  view_project: string
  whatsapp_prefix: string
  whatsapp_suffix: string
  items: PortfolioItem[]
}

type Props = {
  lang: 'he' | 'en'
  dict: PortfolioDict
}

// ─── Shared card class strings ────────────────────────────────────────────────

const cardBase =
  'group flex flex-col overflow-hidden rounded-[24px] border border-brand-border bg-white shadow-soft transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-2 hover:shadow-card-hover sm:rounded-[28px]'

const tagBase =
  'rounded-full border border-brand-border bg-brand-cream px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-brand-steel'

// ─── Component ────────────────────────────────────────────────────────────────

export default async function Portfolio({ lang, dict }: Props) {
  const sanityProjects = await getAllProjects()
  const hasSanity = sanityProjects.length > 0

  return (
    <section id="portfolio" className="bg-brand-cream px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">

        {/* Section header */}
        <div className="mb-14 text-center lg:mb-20">
          <h2 className="text-3xl font-bold tracking-[-0.025em] text-brand-charcoal sm:text-4xl lg:text-[52px] lg:leading-[1.1]">
            {dict.section_title}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-[1.75] text-brand-steel sm:text-[17px]">
            {dict.section_subtitle}
          </p>
        </div>

        {/* ── Sanity-driven grid ──────────────────────────────────────────── */}
        {hasSanity && (
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {sanityProjects.map((project) => {
              const waMessage = `${dict.whatsapp_prefix} "${project.title}" ${dict.whatsapp_suffix}`
              const thumbUrl = project.thumbnail
                ? urlForImage(project.thumbnail).width(640).height(416).url()
                : null

              return (
                <article key={project._id} className={cardBase}>
                  {/* Thumbnail */}
                  <div className="relative h-48 w-full overflow-hidden bg-brand-border/40 sm:h-52">
                    {thumbUrl ? (
                      <Image
                        src={thumbUrl}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.04]"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    ) : (
                      <span
                        className="absolute bottom-3 right-4 select-none font-raleway text-[80px] font-black leading-none text-black/[0.04] rtl:left-4 rtl:right-auto"
                        aria-hidden="true"
                      >
                        {project.title.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <h3 className="mb-3 text-[16px] font-bold tracking-[-0.01em] text-brand-charcoal">
                      {project.title}
                    </h3>

                    {project.techStack && project.techStack.length > 0 && (
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
                        href={`/${lang}/portfolio/${project.slug.current}`}
                        className="text-[13px] font-semibold tracking-wide text-brand-charcoal underline-offset-2 transition-colors duration-200 hover:text-brand-steel hover:underline"
                      >
                        {dict.view_project}
                      </Link>
                      <a
                        href={getWhatsAppURL(waMessage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[13px] text-brand-steel/70 transition-colors duration-200 hover:text-brand-charcoal"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* ── Dict fallback grid ──────────────────────────────────────────── */}
        {!hasSanity && (
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {dict.items.map((item) => {
              const waMessage = `${dict.whatsapp_prefix} "${item.title}" ${dict.whatsapp_suffix}`

              return (
                <article key={item.id} className={cardBase}>
                  {/* Visual placeholder */}
                  <div
                    className="relative h-48 w-full overflow-hidden sm:h-52"
                    style={{ backgroundColor: item.color }}
                  >
                    <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-brand-charcoal backdrop-blur-sm rtl:left-auto rtl:right-4">
                      {item.category}
                    </div>
                    <span
                      className="absolute bottom-3 right-4 select-none font-raleway text-[80px] font-black leading-none text-black/[0.04] rtl:left-4 rtl:right-auto"
                      aria-hidden="true"
                    >
                      {item.title.charAt(0)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <h3 className="mb-2 text-[16px] font-bold tracking-[-0.01em] text-brand-charcoal">
                      {item.title}
                    </h3>
                    <p className="mb-5 flex-1 text-[14px] leading-relaxed text-brand-steel">
                      {item.description}
                    </p>

                    <div className="mb-5 flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span key={tag} className={tagBase}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <a
                      href={getWhatsAppURL(waMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[13px] font-semibold tracking-wide text-brand-charcoal transition-colors duration-200 hover:text-brand-steel"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {dict.view_project}
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
