import Link from 'next/link'
import { MessageCircle, ChevronDown } from 'lucide-react'
import { getWhatsAppURL } from '@/lib/whatsapp'
import { siteConfig, usesPlaceholderDomain } from '@/lib/config'
import type { Locale } from '@/lib/i18n'
import { getProjects, projectTitle } from '@/content/projects'
import ProjectScreens from '@/components/ProjectScreens'

/**
 * The hero.
 *
 * It used to be a 50/50 grid with the wordmark as a static image on one side -
 * the most common agency hero layout there is, and the second time the logo
 * appeared above the fold, 200px below the one in the nav.
 *
 * The lockup is gone and a real client site takes the space, scrolling inside
 * the device frames. The first screen shows the work instead of asserting it,
 * and the number under the frames comes from `projects.ts` rather than from
 * a copywriter.
 *
 * The capture is the lightest of the five - 20KB desktop, 26KB phone - which
 * matters because this is above the fold and competing with the paper texture
 * for the LCP.
 */

type HeroDict = {
  eyebrow: string
  h1_pre: string
  h1_focus: string
  h1_post: string
  subtitle: string
  cta_primary: string
  cta_secondary: string
  cta_note: string
  whatsapp_message: string
  stat_projects: string
  stat_pages: string
  stat_fields: string
}

type Props = {
  lang: Locale
  dict: HeroDict
}

export default function Hero({ lang, dict }: Props) {
  const projects = getProjects()

  /*
   * The showcase. J-Cafe by preference: it is the lightest capture and the
   * richest to look at - a storefront with photography, where the other public
   * two are text-heavy. Falls back to whichever project has a capture, so the
   * hero cannot render an empty frame.
   */
  const showcase =
    projects.find((p) => p.slug === 'jcafe-kosher' && p.screens) ?? projects.find((p) => p.screens)

  /*
   * Counted, not claimed. Every figure here is derived from the content file,
   * so it cannot drift away from the truth when a project is added.
   */
  const pageCount = projects
    .flatMap((p) => p.results ?? [])
    .filter((r) => /^\d+$/.test(r.metric) && (r.label.he === 'עמודים' || r.label.en === 'pages'))
    .reduce((sum, r) => sum + Number(r.metric), 0)

  // Already stripped of pending values by `getProjects`.
  const heroMetric = showcase?.results?.[0]

  const stats = [
    { value: String(projects.length), label: dict.stat_projects },
    { value: String(pageCount), label: dict.stat_pages },
    { value: String(new Set(projects.map((p) => p.category)).size), label: dict.stat_fields },
  ]

  return (
    <section className="header-band relative px-4 pb-14 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8 lg:pb-20 lg:pt-12">
      <div
        className="bg-grain pointer-events-none absolute inset-0 select-none opacity-[0.028]"
        aria-hidden="true"
      />

      {/* Margin annotation (blueprint element 3, xl+ only). Everything in it
          is checkable: the domain from config, the eyebrow the page itself
          carries. Decoration to a reader - hidden from AT. */}
      {/* Gated on the real domain: with no env the placeholder hostname
          rendered as visible hero text in a dev build. */}
      {!usesPlaceholderDomain && (
        <span className="draft-annotation" aria-hidden="true">
          <span className="draft-annotation__text">
            {new URL(siteConfig.url).hostname} — {dict.eyebrow}
          </span>
        </span>
      )}

      <div className="relative mx-auto max-w-7xl">
        {/*
          No order override on either column. Source order alone is correct in
          an RTL grid - the words come first, so in Hebrew they land on the
          right with the work to their left, and in English the two swap
          without a second rule.
        */}
        {/* `lg:items-start`, not `items-center`. The columns are unequal - the
            text column is up to 372px taller in English - and centring the
            short one printed a 186px empty band above AND below the device
            frames at 1440. The same defect was fixed once before for the old
            lockup (commit 8c81bfb); this is its regression, pinned this time
            with a measurement. Below `lg` the grid is one column and
            alignment does nothing. */}
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:gap-14">
          {/* ── The words ─────────────────────────────────────── */}
          {/* `min-w-0`: a grid item defaults to `min-width: auto`, so the column
              would grow to its widest unbreakable word rather than letting
              `overflow-wrap` break it. */}
          <div className="flex min-w-0 flex-col gap-6 lg:gap-7">
            <p className="eyebrow animate-fade-up-delay">{dict.eyebrow}</p>

            {/* No entry animation on the H1, deliberately: it is the likely
                LCP element, and `fade-up ... 0.15s both` held it at opacity 0
                for ~0.83s after styles applied - pure added LCP on the most
                important text on the page. The eyebrow and subtitle keep the
                motion; the headline is simply there. */}
            <h1 className="leading-[1.06] text-brand-ink lg:leading-[1.02]">
              {dict.h1_pre}
              {dict.h1_pre ? ' ' : ''}
              {/* A marker stroke behind the phrase, painted per wrapped line.
                  The previous absolute sibling was sized to the wrapper's
                  bounding box, so when the phrase wrapped the stroke ran 387px
                  past the last word. See `.marker-wash` in globals.css. */}
              <span className="marker-wash">{dict.h1_focus}</span>
              {dict.h1_post ? ` ${dict.h1_post}` : ''}
            </h1>

            <p className="animate-fade-up-delay-2 max-w-[34rem] text-[1.1875rem] leading-[1.7] text-brand-slate">
              {dict.subtitle}
            </p>

            <div className="animate-fade-in flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                <a
                  href={getWhatsAppURL(dict.whatsapp_message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics="whatsapp:hero"
                  className="btn flex items-center gap-2.5"
                >
                  <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
                  {dict.cta_primary}
                </a>

                {siteConfig.phoneDisplay && (
                  <a
                    href={`tel:${siteConfig.phoneDial}`}
                    dir="ltr"
                    data-analytics="phone:hero"
                    className="text-[1rem] font-semibold text-brand-ink transition-colors duration-300 hover:text-brand-accent"
                  >
                    {siteConfig.phoneDisplay}
                  </a>
                )}

                <a
                  href="#services"
                  className="flex items-center gap-2 text-[1rem] font-medium text-brand-slate transition-colors duration-300 hover:text-brand-ink"
                >
                  {dict.cta_secondary}
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>

              {/* Risk reversal - removes the "what am I signing up for" hesitation */}
              <p className="text-[0.875rem] text-brand-slate">{dict.cta_note}</p>
            </div>
          </div>

          {/* ── The work ──────────────────────────────────────── */}
          {showcase?.screens && (
            <div className="animate-fade-in flex min-w-0 flex-col gap-4">
              {/* React 19 hoists these into <head>. Without them the captures
                  started downloading only after hydration + observer - 4.4s of
                  empty frames on throttled 4G, in the section whose whole job
                  is showing the work. 20KB + 27KB, above the fold, worth
                  fetching from byte one. */}
              <link rel="preload" as="image" href={showcase.screens.mobile} />
              {/* Below 768px the monitor frame is display:none, so its capture
                  was preloaded bytes the page never painted - on every phone
                  load. */}
              <link
                rel="preload"
                as="image"
                href={showcase.screens.desktop}
                media="(min-width: 768px)"
              />
              <ProjectScreens
                desktop={showcase.screens.desktop}
                mobile={showcase.screens.mobile}
                title={projectTitle(showcase, lang)}
                eager
              />

              {/* Names the work, so the frames are evidence rather than
                  decoration. Linked, because a visitor who is interested in
                  what they just watched should be able to go and read it. */}
              {/* The caption is a leader-line callout (blueprint element 2):
                  the label, a hairline, and an accent tick pointing at the
                  device it names. The line is decoration; the link is real. */}
              <Link
                href={`/${lang}/portfolio/${showcase.slug}`}
                className="draft-callout text-[0.875rem] text-brand-slate transition-colors duration-200 hover:text-brand-accent"
              >
                <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-semibold text-brand-ink">
                    {projectTitle(showcase, lang)}
                  </span>
                  {/* The first *published* metric. Reading `results[0]` directly
                    would print `TODO(metric)` under the hero the moment a
                    project's first metric is one we are still waiting on. */}
                  {heroMetric && (
                    <span>
                      · {heroMetric.metric} {heroMetric.label[lang]}
                    </span>
                  )}
                </span>
                <span className="draft-callout__line" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>

        {/*
          The counted row. It fills the space the wordmark used to occupy with
          something a stranger can check, and every figure is derived from
          `projects.ts` at build time rather than typed into a dictionary.
        */}
        <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-brand-line pt-8 lg:mt-16 lg:gap-10">
          {/* dt-then-dd is the valid and correctly-paired order; the visual
              order (number above label) comes from flex-col-reverse. The old
              markup wrapped a <p> in the div - outside the dl content model -
              and carried every label twice, once sr-only and once aria-hidden. */}
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-1">
              {/* The mono label voice (blueprint element 5) - these are the
                  most measurement-like figures on the page and were the only
                  ones still wearing body type. */}
              <dt className="font-display text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand-slate">
                {stat.label}
              </dt>
              {/* Scaled with the viewport: at 44px against the h1's 28.9px floor,
                  the counted row - a supporting element - was 1.5x the page's own
                  headline on a phone. The h1 leads at every width now. */}
              <dd className="num text-[1.625rem] leading-none sm:text-[2.75rem] lg:text-[3.5rem]">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
