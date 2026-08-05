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
    <section className="header-band relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8 lg:pb-24 lg:pt-12">
      <div
        className="bg-grain pointer-events-none absolute inset-0 select-none opacity-[0.028]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/*
            No order override on either column.
            Source order alone gives the right result in both directions: the
            text comes first, so in Hebrew it lands on the right with the logo
            to its left, and in English the two swap without a second rule.
          */}
          {/* ── Text column ───────────────────────────────────── */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {/* H1 */}
            {/* No per-locale font class here. `font-dm-sans` and `font-assistant`
                were left over from the previous type system — dm-sans no longer
                exists as a token, so English fell back to the body face. The base
                layer already gives h1 the display family, which resolves to
                Chakra Petch for Latin and Heebo for Hebrew on its own. */}
            <h1 className="animate-fade-up-delay text-[40px] leading-[1.06] text-brand-ink sm:text-5xl lg:text-[64px] lg:leading-[1.04]">
              {dict.h1_pre}
              {dict.h1_pre ? ' ' : ''}
              {/* Animated underline on focus word */}
              <span className="relative inline-block">
                <span className="relative z-10">{dict.h1_focus}</span>
                <span
                  className={`absolute bottom-1 left-0 h-[3px] w-full rounded-full bg-brand-line animate-underline-grow ${
                    isRtl ? 'underline-rtl' : 'underline-ltr'
                  }`}
                />
              </span>
              {dict.h1_post ? ` ${dict.h1_post}` : ''}
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-up-delay-2 max-w-[500px] text-lg leading-[1.75] text-brand-slate sm:text-[19px]">
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
                  className="flex items-center gap-2 text-[15px] font-medium text-brand-slate transition-colors duration-300 hover:text-brand-ink"
                >
                  {dict.cta_secondary}
                  <ChevronDown className="h-4 w-4" />
                </a>
              </div>

              {/* Risk reversal - removes the "what am I signing up for" hesitation */}
              <p className="text-[13px] text-brand-slate/90">{dict.cta_note}</p>
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
