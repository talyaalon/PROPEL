import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink, ArrowRight } from 'lucide-react'
import type { Locale } from '../../../../../middleware'
import { getProjectBySlug, getAllProjectSlugs } from '@/sanity/lib/queries'
import { urlForImage } from '@/sanity/lib/image'

// ── ISR: revalidate every 60 seconds so new CMS content appears without redeploy
export const revalidate = 60

type Props = {
  params: Promise<{ lang: Locale; slug: string }>
}

// ── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return {}
  const description = project.problem?.[lang] ?? ''
  return {
    title: `${project.title} | PROPEL`,
    description: description.slice(0, 155),
  }
}

// ── Static params — pre-render known slugs at build time ────────────────────

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs()
  return ['he', 'en'].flatMap((lang) =>
    slugs.map((slug) => ({ lang, slug }))
  )
}

// ── Video URL transformer ────────────────────────────────────────────────────

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    // YouTube: youtube.com/watch?v=ID  or  youtu.be/ID
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace('/', '')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    // Vimeo: vimeo.com/ID
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.replace('/', '')
      return id ? `https://player.vimeo.com/video/${id}` : null
    }
    return null
  } catch {
    return null
  }
}

// ── UI labels (inline bilingual — avoids touching dict files for now) ────────

const labels = {
  he: {
    backToPortfolio: 'חזרה לפורטפוליו',
    problem: 'האתגר',
    solution: 'הפתרון',
    results: 'תוצאות',
    visitSite: 'לאתר החי',
    screenshots: 'צילומי מסך',
  },
  en: {
    backToPortfolio: 'Back to Portfolio',
    problem: 'The Challenge',
    solution: 'The Solution',
    results: 'Results',
    visitSite: 'Visit Live Site',
    screenshots: 'Screenshots',
  },
}

// ── Page component ───────────────────────────────────────────────────────────

export default async function ProjectPage({ params }: Props) {
  const { lang, slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) notFound()

  const t = labels[lang]
  const isRtl = lang === 'he'
  const embedUrl = project.videoUrl ? getEmbedUrl(project.videoUrl) : null

  const thumbnailUrl = project.thumbnail
    ? urlForImage(project.thumbnail).width(1400).height(700).url()
    : null

  return (
    <div className="min-h-screen bg-brand-cream">

      {/* ── Hero banner ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-charcoal text-brand-cream">
        {/* Thumbnail as dim background */}
        {thumbnailUrl && (
          <div className="absolute inset-0">
            <Image
              src={thumbnailUrl}
              alt={project.title}
              fill
              className="object-cover opacity-20"
              priority
            />
          </div>
        )}

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-16">
          {/* Back link */}
          <Link
            href={`/${lang}/#portfolio`}
            className={`mb-10 inline-flex items-center gap-2 text-sm font-medium text-brand-light-steel transition-colors hover:text-brand-cream ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <ArrowRight
              className={`h-4 w-4 transition-transform ${isRtl ? '' : 'rotate-180'}`}
            />
            {t.backToPortfolio}
          </Link>

          {/* Title */}
          <h1 className="mb-6 font-raleway text-4xl font-black leading-tight tracking-tight lg:text-[64px] lg:leading-none">
            {project.title}
          </h1>

          {/* Tech stack chips */}
          {project.techStack && project.techStack.length > 0 && (
            <div className={`flex flex-wrap gap-2 ${isRtl ? 'justify-end' : 'justify-start'}`}>
              {project.techStack.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-brand-cream backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Main content grid ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-16 lg:py-24">
        <div className={`grid gap-12 lg:grid-cols-2 lg:gap-20 ${isRtl ? 'direction-rtl' : ''}`}>

          {/* Left column: Problem + Solution */}
          <div className="space-y-12">
            {/* Problem */}
            {project.problem?.[lang] && (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="block h-px w-8 bg-brand-charcoal" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-steel">
                    {t.problem}
                  </h2>
                </div>
                <p className="text-lg leading-relaxed text-brand-charcoal">
                  {project.problem[lang]}
                </p>
              </div>
            )}

            {/* Solution */}
            {project.solution?.[lang] && (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="block h-px w-8 bg-brand-charcoal" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-steel">
                    {t.solution}
                  </h2>
                </div>
                <p className="text-lg leading-relaxed text-brand-charcoal">
                  {project.solution[lang]}
                </p>
              </div>
            )}
          </div>

          {/* Right column: Results + CTA */}
          <div className="flex flex-col gap-8">
            {/* Results card */}
            {project.result?.[lang] && (
              <div className="rounded-[22px] bg-brand-charcoal p-8 text-brand-cream">
                <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-brand-light-steel">
                  {t.results}
                </h2>
                {/* Large display number decoration */}
                <p className="font-raleway text-[56px] font-black leading-none text-white/10 select-none"
                   aria-hidden="true">
                  ↑
                </p>
                <p className="mt-4 text-lg leading-relaxed text-brand-cream/90">
                  {project.result[lang]}
                </p>
              </div>
            )}

            {/* Live site CTA */}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-3 rounded-full bg-brand-charcoal px-8 py-4 font-semibold text-brand-cream transition-all duration-300 hover:bg-brand-black hover:shadow-2xl hover:shadow-brand-charcoal/30"
              >
                <ExternalLink className="h-5 w-5 transition-transform group-hover:scale-110" />
                {t.visitSite}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Media section ─────────────────────────────────────────────────── */}
      {(embedUrl || (project.gallery && project.gallery.length > 0)) && (
        <section className="border-t border-brand-border bg-white px-6 py-16 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-7xl">

            {/* Video embed */}
            {embedUrl && (
              <div className="mb-16 overflow-hidden rounded-[22px] shadow-2xl">
                <div className="relative aspect-video w-full">
                  <iframe
                    src={embedUrl}
                    title={`${project.title} — video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>
              </div>
            )}

            {/* Screenshot gallery */}
            {project.gallery && project.gallery.length > 0 && (
              <>
                <h2 className={`mb-8 text-xs font-bold uppercase tracking-[0.2em] text-brand-steel ${isRtl ? 'text-right' : ''}`}>
                  {t.screenshots}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {project.gallery.map((img, i) => {
                    const src = urlForImage(img).width(800).height(560).url()
                    return (
                      <div
                        key={img._key ?? i}
                        className="overflow-hidden rounded-[16px] border border-brand-border bg-brand-cream shadow-sm transition-shadow hover:shadow-lg"
                      >
                        <div className="relative aspect-[10/7] w-full">
                          <Image
                            src={src}
                            alt={img.alt ?? `${project.title} screenshot ${i + 1}`}
                            fill
                            className="object-cover"
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
