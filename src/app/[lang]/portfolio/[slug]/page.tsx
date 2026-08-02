import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink, ArrowRight, ArrowLeft, MessageCircle } from 'lucide-react'
import { locales, isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { siteConfig } from '@/lib/config'
import { getWhatsAppURL } from '@/lib/whatsapp'
import { breadcrumbSchema, caseStudySchema } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import { getProjects, getProjectBySlug } from '@/content/projects'

type Props = {
  params: Promise<{ lang: string; slug: string }>
}

// Only the slugs that exist are routable — anything else is a 404, not a
// server render that then throws.
export const dynamicParams = false

export function generateStaticParams() {
  return locales.flatMap((lang) => getProjects().map((project) => ({ lang, slug: project.slug })))
}

// ── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  if (!isLocale(lang)) return {}

  const project = getProjectBySlug(slug)
  if (!project) return {}

  const description = project.summary[lang]
  const url = `${siteConfig.url}/${lang}/portfolio/${project.slug}`

  return {
    title: project.title,
    description,
    alternates: {
      canonical: url,
      languages: {
        he: `${siteConfig.url}/he/portfolio/${project.slug}`,
        en: `${siteConfig.url}/en/portfolio/${project.slug}`,
        'x-default': `${siteConfig.url}/he/portfolio/${project.slug}`,
      },
    },
    openGraph: {
      type: 'article',
      title: `${project.title} | PROPEL`,
      description,
      url,
    },
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ProjectPage({ params }: Props) {
  const { lang, slug } = await params
  if (!isLocale(lang)) notFound()

  const project = getProjectBySlug(slug)
  if (!project) notFound()

  const dict = await getDictionary(lang)
  const t = dict.portfolio.case_study
  const isRtl = lang === 'he'
  const BackArrow = isRtl ? ArrowRight : ArrowLeft

  const published = getProjects()
  const index = published.findIndex((p) => p.slug === project.slug)
  const next = published[(index + 1) % published.length]
  const hasNext = published.length > 1

  return (
    <div className="bg-brand-void">
      <JsonLd schema={caseStudySchema(project, lang)} />
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'PROPEL', url: `${siteConfig.url}/${lang}` },
          { name: dict.nav.portfolio, url: `${siteConfig.url}/${lang}#portfolio` },
          {
            name: project.title,
            url: `${siteConfig.url}/${lang}/portfolio/${project.slug}`,
          },
        ])}
      />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-brand-ink/15 bg-brand-deep text-brand-ink">
        {project.thumbnail?.src && (
          <div className="absolute inset-0">
            <Image
              src={project.thumbnail.src}
              alt=""
              fill
              priority
              className="object-cover opacity-20"
              sizes="100vw"
            />
          </div>
        )}

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-20">
          <Link
            href={`/${lang}#portfolio`}
            className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-brand-muted transition-colors hover:text-brand-ink"
          >
            <BackArrow className="h-4 w-4" aria-hidden="true" />
            {t.back}
          </Link>

          <h1 className="mb-6 font-display leading-none">{project.title}</h1>

          {/* Client / year — omitted entirely when unknown rather than shown blank */}
          {(project.client || project.year) && (
            <dl className="mb-8 flex flex-wrap gap-x-10 gap-y-4 text-sm">
              {project.client && (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-muted">
                    {t.client}
                  </dt>
                  <dd className="mt-1 font-medium text-brand-ink">{project.client[lang]}</dd>
                </div>
              )}
              {project.year && (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-muted">
                    {t.year}
                  </dt>
                  <dd className="mt-1 font-medium text-brand-ink" dir="ltr">
                    {project.year}
                  </dd>
                </div>
              )}
            </dl>
          )}

          {project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-brand-ink/20 bg-brand-ink/10 px-3 py-1 text-xs font-semibold text-brand-lead backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Results strip ─────────────────────────────────────────────────── */}
      {project.results && project.results.length > 0 && (
        <section className="border-b border-brand-ink/15 bg-brand-deep" aria-label={t.results}>
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8 lg:py-12">
            {project.results.map((result) => (
              <div key={result.label[lang]}>
                <p className="num text-[40px] leading-none lg:text-[48px]">{result.metric}</p>
                <p className="mt-2 text-[14px] leading-snug text-brand-muted">
                  {result.label[lang]}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Challenge / Solution ──────────────────────────────────────────── */}
      {/* Falls back to the summary while the full narrative is still being written,
 so a published project never renders an empty page. */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {project.challenge || project.solution ? (
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            {project.challenge && <Block title={t.challenge} body={project.challenge[lang]} />}
            {project.solution && <Block title={t.solution} body={project.solution[lang]} />}
          </div>
        ) : (
          <p className="max-w-2xl text-lg leading-relaxed text-brand-ink">
            {project.summary[lang]}
          </p>
        )}

        {project.liveUrl && (
          <div className="mt-12 lg:mt-16">
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn group"
            >
              <ExternalLink
                className="h-5 w-5 transition-transform group-hover:scale-110"
                aria-hidden="true"
              />
              {t.visit_site}
            </a>
          </div>
        )}
      </section>

      {/* ── Gallery ───────────────────────────────────────────────────────── */}
      {project.gallery && project.gallery.length > 0 && (
        <section className="border-t border-brand-ink/15 bg-brand-deep px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-8 text-xs font-bold uppercase tracking-[0.2em] text-brand-muted">
              {t.screenshots}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.gallery.map((image) => (
                <div
                  key={image.src}
                  className="overflow-hidden border border-brand-ink/15 bg-brand-void transition-shadow "
                >
                  <div className="relative aspect-[10/7] w-full">
                    <Image
                      src={image.src}
                      alt={image.alt[lang]}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Closing CTA + next project ────────────────────────────────────── */}
      <section className="border-t border-brand-ink/15 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="card p-8 sm:p-12">
            <h2 className="font-display">{t.cta_title}</h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-brand-lead">
              {t.cta_body}
            </p>
            <a
              href={getWhatsAppURL(
                `${dict.portfolio.whatsapp_prefix} "${project.title}" ${dict.portfolio.whatsapp_suffix}`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics={`whatsapp:case-study-${project.slug}`}
              className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-brand-void px-8 py-4 text-[15px] font-semibold text-brand-ink transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
            >
              <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
              {t.cta_label}
            </a>
          </div>

          {hasNext && (
            <Link
              href={`/${lang}/portfolio/${next.slug}`}
              className="card group mt-8 flex items-center justify-between gap-4 p-6 sm:p-7"
            >
              <span>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-muted">
                  {t.next_project}
                </span>
                <span className="mt-1.5 block text-[18px] font-bold text-brand-ink">
                  {next.title}
                </span>
              </span>
              <span
                className="text-brand-muted transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                aria-hidden="true"
              >
                {isRtl ? '←' : '→'}
              </span>
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span className="block h-px w-8 bg-brand-accent" aria-hidden="true" />
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-muted">{title}</h2>
      </div>
      <p className="text-lg leading-relaxed text-brand-ink">{body}</p>
    </div>
  )
}
