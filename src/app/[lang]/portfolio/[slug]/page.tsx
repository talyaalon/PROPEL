import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink, ArrowRight, ArrowLeft, MessageCircle, Check } from 'lucide-react'
import { locales, isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { siteConfig } from '@/lib/config'
import { pageMetadata } from '@/lib/pageMetadata'
import { getWhatsAppURL } from '@/lib/whatsapp'
import { breadcrumbSchema, caseStudySchema } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import ProjectScreens from '@/components/ProjectScreens'
import PrivateProjectShowcase from '@/components/PrivateProjectShowcase'
import FlowDiagram from '@/components/FlowDiagram'
import { getProjects, getProjectBySlug, projectTitle, changedLines } from '@/content/projects'

type Props = {
  params: Promise<{ lang: string; slug: string }>
}

// Only the slugs that exist are routable - anything else is a 404, not a
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

  // Brand name + work descriptor. A name-only title spends the SERP line on
  // a brand nobody searches yet; the suffix says what the work was.
  const suffix = project.titleTag?.[lang]
  return pageMetadata({
    lang,
    path: `portfolio/${project.slug}`,
    title: suffix ? `${projectTitle(project, lang)} - ${suffix}` : projectTitle(project, lang),
    description: project.summary[lang],
    type: 'article',
  })
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

  // Both already stripped of pending values by `getProjects`.
  const metrics = project.results ?? []
  const changed = changedLines(project, lang)

  /*
   * Clause numbers for the blueprint language (docs/design-language.md #1).
   * Computed from the blocks this project actually renders, so a project
   * without a flow does not skip a number - the document stays continuous.
   */
  const clause = (() => {
    let n = 0
    return () => String(++n).padStart(2, '0')
  })()
  const clauses = {
    stuck: project.challenge ? clause() : '',
    built: project.solution ? clause() : '',
    flow: project.flow?.length ? clause() : '',
    changed: changed.length > 0 ? clause() : '',
    stack: project.techStack.length > 0 ? clause() : '',
  }

  const published = getProjects()
  const index = published.findIndex((p) => p.slug === project.slug)
  const next = published[(index + 1) % published.length]
  const hasNext = published.length > 1

  return (
    <div className="bg-brand-surface">
      <JsonLd schema={caseStudySchema(project, lang)} />
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'PROPEL', url: `${siteConfig.url}/${lang}` },
          { name: dict.nav.portfolio, url: `${siteConfig.url}/${lang}/portfolio` },
          {
            name: projectTitle(project, lang),
            url: `${siteConfig.url}/${lang}/portfolio/${project.slug}`,
          },
        ])}
      />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-brand-line bg-brand-panel text-brand-ink">
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
            href={`/${lang}/portfolio`}
            className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-brand-slate transition-colors hover:text-brand-ink"
          >
            <BackArrow className="h-4 w-4" aria-hidden="true" />
            {t.back}
          </Link>

          {/*
            The brand name is the eyebrow and the problem is the `h1`.

            It was the other way round, over a row of technology chips, and
            that ordering sells to the wrong reader: `Next.js, Supabase, ODOO,
            Stripe` means something to a developer and nothing to the business
            owner we want as a client. What they recognise is their own problem
            stated back to them.

            The name stays visible here rather than living only in the
            `<title>` - a case study that never names the client reads as one we
            are not allowed to talk about.
          */}
          {/*
            Only when the H1 is something OTHER than the name. Two of the five
            case studies carry no `headline`, so the H1 falls back to the title
            - and the eyebrow printed the identical string directly above it,
            small then large, with nothing in between. That reads as a
            rendering bug rather than a design. When the fallback fires the H1
            already names the client, so the eyebrow has nothing left to add.
          */}
          {project.headline?.[lang] && (
            <p className="eyebrow mb-4">{projectTitle(project, lang)}</p>
          )}

          <h1 className="mb-6 font-display leading-[1.08]">
            {project.headline?.[lang] ?? projectTitle(project, lang)}
          </h1>

          {/* Client / year - omitted entirely when unknown rather than shown blank */}
          {(project.client || project.year) && (
            <dl className="mb-8 flex flex-wrap gap-x-10 gap-y-4 text-sm">
              {project.client && (
                <div>
                  <dt className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-brand-slate">
                    {t.client}
                  </dt>
                  <dd className="mt-1 font-medium text-brand-ink">{project.client[lang]}</dd>
                </div>
              )}
              {project.year && (
                <div>
                  <dt className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-brand-slate">
                    {t.year}
                  </dt>
                  <dd className="mt-1 font-medium text-brand-ink" dir="ltr">
                    {project.year}
                  </dd>
                </div>
              )}
            </dl>
          )}

          {/* The technology chips used to sit here, directly under the brand
              name. They are the last block before the CTA now - they still
              matter to a reader who knows what they mean, they are simply not
              the first thing a business owner meets. */}
        </div>
      </section>

      {/* ── Results strip ─────────────────────────────────────────────────── */}
      {/* `publishedResults`, so a metric we have not been given yet cannot
          render as an empty block. An empty stat block is worse than none: it
          reads as a number the client could not produce. */}
      {metrics.length > 0 && (
        <section className="border-b border-brand-line bg-brand-panel" aria-label={t.results}>
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8 lg:py-12">
            {metrics.map((result) => (
              <div key={result.label[lang]}>
                <p className="num text-[2.5rem] leading-none lg:text-[3rem]">{result.metric}</p>
                <p className="mt-2 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand-slate">
                  {result.label[lang]}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── The work itself ───────────────────────────────────────────────
          The card that links here shows the client's site scrolling inside a
          monitor and a phone. Clicking through landed on a page with no image
          at all - the journey went from the best asset on the site to the
          emptiest one. The captures already exist and are already deployed;
          they were simply never rendered on this route. */}
      {/* Always rendered. It used to be gated on `screens`, so the two systems
          behind a login - the strongest engineering in the portfolio - had no
          visual block at all on their own case study. The placeholder at least
          says the absence is deliberate. */}
      {
        <section
          className="border-t border-brand-line bg-brand-surface px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
          aria-label={t.screenshots}
        >
          <div className="mx-auto max-w-5xl">
            {project.screens ? (
              <ProjectScreens
                desktop={project.screens.desktop}
                mobile={project.screens.mobile}
                title={projectTitle(project, lang)}
              />
            ) : (
              /* A system behind a login. Full width here, where there is room
                 for a recording to be legible - the card version is 330px. */
              <PrivateProjectShowcase
                media={project.media}
                lang={lang}
                placeholderLabel={dict.portfolio.private_project}
                ariaLabel={dict.portfolio.showcase_label}
                prevLabel={dict.portfolio.showcase_prev}
                nextLabel={dict.portfolio.showcase_next}
              />
            )}
          </div>
        </section>
      }

      {/* ── What was stuck / what we built / what changed ──────────────────
          The narrative, in the order a buyer reads it: their problem, our
          answer, the difference. Falls back to the summary while a project's
          narrative is still unwritten, so a published project is never an
          empty page. */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {project.challenge || project.solution ? (
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            {project.challenge && (
              <Block clause={clauses.stuck} title={t.stuck} body={project.challenge[lang]} />
            )}
            {project.solution && (
              <Block clause={clauses.built} title={t.built} body={project.solution[lang]} />
            )}
          </div>
        ) : (
          <p className="max-w-2xl text-lg leading-relaxed text-brand-ink">
            {project.summary[lang]}
          </p>
        )}

        {/* The process we built, drawn from the approved narrative - every
            node names a screen or an action that exists. This is the block a
            template cannot fake, which is the whole argument of the design
            language. */}
        {project.flow && project.flow.length > 0 && (
          <div className="mt-14 lg:mt-20">
            <SectionLabel clause={clauses.flow}>{t.flow_title}</SectionLabel>
            <div className="mt-8 max-w-2xl">
              <FlowDiagram steps={project.flow} lang={lang} />
            </div>
          </div>
        )}

        {/* Only the outcome lines that carry a real number. Every line for
            these three is still `PENDING`, so this renders for nobody yet and
            appears per project as each client answers. */}
        {changed.length > 0 && (
          <div className="mt-14 lg:mt-20">
            <SectionLabel clause={clauses.changed}>{t.changed}</SectionLabel>
            <ul className="mt-6 grid max-w-3xl gap-3">
              {changed.map((line) => (
                <li key={line} className="flex items-start gap-3 text-lg leading-relaxed">
                  <Check
                    className="mt-1.5 h-4 w-4 flex-shrink-0 text-brand-accent"
                    aria-hidden="true"
                  />
                  <span className="text-brand-ink">{line}</span>
                </li>
              ))}
            </ul>
          </div>
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

      {/* ── The stack ─────────────────────────────────────────────────────
          Last block before the CTA. It was the first thing under the project
          name, which put `Next.js, Supabase, ODOO, Stripe` in front of a
          reader who does not know what any of it is. It has not been removed -
          a technical reader evaluating us wants exactly this - it is simply
          after the part that says what the work was for. */}
      {project.techStack.length > 0 && (
        <section
          className="border-t border-brand-line bg-brand-panel px-4 py-12 sm:px-6 lg:px-8"
          aria-labelledby="case-stack"
        >
          <div className="mx-auto max-w-7xl">
            <SectionLabel clause={clauses.stack} id="case-stack">
              {t.stack}
            </SectionLabel>
            {/* A spec table, not a chip row (blueprint element 7). The row
                headers are real semantics - a reader gets "field: value". */}
            <table className="spec-table mt-6 max-w-2xl">
              <tbody>
                <tr>
                  <th scope="row">{t.spec_field}</th>
                  <td>{dict.portfolio.categories[project.category]}</td>
                </tr>
                <tr>
                  <th scope="row">{t.stack}</th>
                  {/* dir on an inner span, not the cell: a dir="ltr" cell
                      start-aligns LEFT inside an RTL table, stranding the
                      value ~330px from its own row header. The span isolates
                      the Latin list's internal order; the cell keeps the
                      page's alignment. */}
                  <td>
                    <span dir="ltr">{project.techStack.join(' · ')}</span>
                  </td>
                </tr>
                {project.year && (
                  <tr>
                    <th scope="row">{t.year}</th>
                    <td>
                      <span dir="ltr">{project.year}</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Gallery ───────────────────────────────────────────────────────── */}
      {project.gallery && project.gallery.length > 0 && (
        <section className="border-t border-brand-line bg-brand-panel px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-8 text-xs font-bold uppercase tracking-[0.2em] text-brand-slate">
              {t.screenshots}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.gallery.map((image) => (
                <div
                  key={image.src}
                  className="overflow-hidden border border-brand-line bg-brand-surface transition-shadow "
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
      <section className="border-t border-brand-line px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="card p-8 sm:p-12">
            <h2 className="font-display">{t.cta_title}</h2>
            <p className="mt-3 max-w-xl text-[1rem] leading-relaxed text-brand-ink">{t.cta_body}</p>
            <a
              href={getWhatsAppURL(
                `${dict.portfolio.whatsapp_prefix} "${projectTitle(project, lang)}" ${dict.portfolio.whatsapp_suffix}`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics={`whatsapp:case-study-${project.slug}`}
              // `.btn` like every other primary CTA. This one was
              // `bg-brand-surface` inside a `--panel` card: 1.02:1 against its
              // own background in both themes, a flat rectangle at the end of
              // the site's strongest sales page.
              className="btn mt-7"
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
                <span className="block text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-brand-slate">
                  {t.next_project}
                </span>
                <span className="mt-1.5 block text-[1.125rem] font-bold text-brand-ink">
                  {projectTitle(next, lang)}
                </span>
              </span>
              {/* An icon rather than the literal glyph - see Services.tsx.
                  U+2192 is absent from Chakra Petch and dragged in two Heebo
                  symbol subsets. `rtl:-scale-x-100` mirrors it. */}
              <ArrowRight
                className="h-4 w-4 text-brand-slate transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                aria-hidden="true"
              />
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}

/**
 * The rule-and-label heading used by every block on this page.
 *
 * Extracted so "what was stuck", "what changed" and the stack cannot drift
 * apart in weight, tracking or colour - three near-identical headings written
 * out three times is how that happens.
 */
function SectionLabel({
  children,
  clause,
  id,
}: {
  children: React.ReactNode
  clause?: string
  id?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="block h-px w-8 bg-brand-accent" aria-hidden="true" />
      {/* min-w-0: the h2 is a flex item, and "TECHNOLOGIES" at 200% text is
          one unbreakable word - without shrink permission it pushed the page
          12px sideways at 320px. Seventh instance of the min-width:auto trap. */}
      <h2
        id={id}
        className="min-w-0 break-words text-xs font-bold uppercase tracking-[0.2em] text-brand-slate"
      >
        {/* The clause number is document furniture - read aloud it is only
            noise before the heading, so it is hidden from AT. */}
        {clause && (
          <span className="clause" aria-hidden="true">
            {clause}
          </span>
        )}
        {children}
      </h2>
    </div>
  )
}

function Block({ clause, title, body }: { clause?: string; title: string; body: string }) {
  return (
    <div>
      <SectionLabel clause={clause}>{title}</SectionLabel>
      {/*
        `whitespace-pre-line`, because the narrative fields carry paragraph
        breaks as `

`. Without it both paragraphs collapse into one wall of
        text - the second paragraph of every `solution` is a distinct point.
      */}
      {/* `anywhere`, not `break-words`: the narrative names real identifiers -
        `resolveOrderCompany` is 19 unbreakable Latin characters, ~330px at
        200% text. `break-word` prevents nothing here because it does not
        lower the paragraph's min-content, and the grid item is sized from it;
        `anywhere` is the only value that does. */}
      <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-brand-ink [overflow-wrap:anywhere]">
        {body}
      </p>
    </div>
  )
}
