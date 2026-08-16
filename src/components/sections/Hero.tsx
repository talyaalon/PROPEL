import { MessageCircle, ChevronDown } from 'lucide-react'
import { getWhatsAppURL } from '@/lib/whatsapp'
import type { Locale } from '@/lib/i18n'
import BrandLockup from '@/components/BrandLockup'

type HeroDict = {
  h1_pre: string
  h1_focus: string
  h1_post: string
  subtitle: string
  cta_primary: string
  cta_secondary: string
  cta_note: string
  brand_tagline: string
  whatsapp_message: string
}

type Props = {
  lang: Locale
  dict: HeroDict
}

export default function Hero({ lang, dict }: Props) {
  const isRtl = lang === 'he'

  return (
    <section className="header-band relative px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8 lg:pb-24 lg:pt-12">
      <div
        className="bg-grain pointer-events-none absolute inset-0 select-none opacity-[0.028]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* `items-center` split the height difference between the columns into
              equal empty bands above and below the shorter one - 108px each side
              in Hebrew, 194px in English. Top-aligned, the lockup sits with the
              headline instead of floating in the middle of a hole. */}
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          {/*
            No order override on either column.
            Source order alone gives the right result in both directions: the
            text comes first, so in Hebrew it lands on the right with the logo
            to its left, and in English the two swap without a second rule.
          */}
          {/* ── Text column ───────────────────────────────────── */}
          {/* `min-w-0`: a grid item defaults to `min-width: auto`, so the
              column grows to its widest unbreakable word instead of
              letting `overflow-wrap` break it. At 320px and 200% text the
              English H1 pushed this column to 348px inside a 288px
              container - 44px of horizontal scroll on the one page that
              still had any. */}
          <div className="flex min-w-0 flex-col gap-6 lg:gap-8">
            {/* H1 */}
            {/* No per-locale font class here. `font-dm-sans` and `font-assistant`
                were left over from the previous type system — dm-sans no longer
                exists as a token, so English fell back to the body face. The base
                layer already gives h1 the display family, which resolves to
                Chakra Petch for Latin and Heebo for Hebrew on its own. */}
            <h1 className="animate-fade-up-delay leading-[1.06] text-brand-ink lg:leading-[1.04]">
              {dict.h1_pre}
              {dict.h1_pre ? ' ' : ''}
              {/* Animated underline on focus word */}
              {/* `max-w-full`: an inline-block sizes to its content, so at 320px
                  with 200% text this span held "Websites and automation" on one
                  348px line inside a 288px column - the last 44px of horizontal
                  scroll anywhere on the site. */}
              <span className="relative inline-block max-w-full">
                <span className="relative z-10">{dict.h1_focus}</span>
                {/*
                  The one emphasis gesture in the hero, and it was a 14%-alpha
                  hairline - measured `rgba(31,34,28,0.14)` at 3px, which reads
                  as an accidental rule rather than as a mark. Full accent, and
                  thick enough to be a marker stroke behind the word rather
                  than a line under it. The RTL `transform-origin` was already
                  correct.
                */}
                <span
                  className={`absolute -bottom-0.5 start-0 -z-10 h-[0.35em] w-full bg-brand-accentWash animate-underline-grow ${
                    isRtl ? 'underline-rtl' : 'underline-ltr'
                  }`}
                />
              </span>
              {dict.h1_post ? ` ${dict.h1_post}` : ''}
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-up-delay-2 max-w-[500px] text-lg leading-[1.75] text-brand-slate sm:text-[1.1875rem]">
              {dict.subtitle}
            </p>

            {/* CTA row */}
            <div className="animate-fade-in flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                <a
                  href={getWhatsAppURL(dict.whatsapp_message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics="whatsapp:hero"
                  className="flex items-center gap-2.5 rounded-full btn"
                >
                  <MessageCircle className="h-[18px] w-[18px]" />
                  {dict.cta_primary}
                </a>
                <a
                  href="#services"
                  className="flex items-center gap-2 text-[1rem] font-medium text-brand-slate transition-colors duration-300 hover:text-brand-ink"
                >
                  {dict.cta_secondary}
                  <ChevronDown className="h-4 w-4" />
                </a>
              </div>

              {/* Risk reversal - removes the "what am I signing up for" hesitation */}
              <p className="text-[0.875rem] text-brand-slate/90">{dict.cta_note}</p>
            </div>
          </div>

          {/* ── Visual panel ──────────────────────────────────── */}
          <div className="animate-fade-in">
            <BrandLockup lang={lang} tagline={dict.brand_tagline} />
          </div>
        </div>
      </div>
    </section>
  )
}
