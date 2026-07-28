import { MessageCircle, ChevronDown } from 'lucide-react'
import { getWhatsAppURL } from '@/lib/whatsapp'
import type { Locale } from '@/lib/i18n'
import HeroVisual from '@/components/HeroVisual'

type HeroDict = {
  badge: string
  h1_pre: string
  h1_focus: string
  h1_post: string
  subtitle: string
  cta_primary: string
  cta_secondary: string
  cta_note: string
  whatsapp_message: string
}

type Props = {
  lang: Locale
  dict: HeroDict
}

export default function Hero({ lang, dict }: Props) {
  const isRtl = lang === 'he'

  return (
    <section className="relative overflow-hidden bg-brand-void px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-32">
      <div
        className="bg-grain pointer-events-none absolute inset-0 select-none opacity-[0.028]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          {/* ── Text column ───────────────────────────────────── */}
          <div className={`flex flex-col gap-7 lg:gap-9 ${isRtl ? 'lg:order-2' : 'lg:order-1'}`}>
            {/* Availability badge */}
            <div className="animate-fade-up inline-flex w-fit items-center gap-2.5 rounded-full border border-brand-ink/15 bg-brand-deep/80 px-4 py-2 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>
              <span className="text-[13px] font-medium text-brand-muted">{dict.badge}</span>
            </div>

            {/* H1 */}
            <h1
              className={`animate-fade-up-delay text-[40px] font-extrabold leading-[1.06] tracking-[-0.03em] text-brand-ink sm:text-5xl lg:text-[64px] lg:leading-[1.04] ${
                isRtl ? 'font-assistant' : 'font-dm-sans'
              }`}
            >
              {dict.h1_pre}
              {dict.h1_pre ? ' ' : ''}
              {/* Animated underline on focus word */}
              <span className="relative inline-block">
                <span className="relative z-10">{dict.h1_focus}</span>
                <span
                  className={`absolute bottom-1 left-0 h-[3px] w-full rounded-full bg-brand-ink/60 animate-underline-grow ${
                    isRtl ? 'underline-rtl' : 'underline-ltr'
                  }`}
                />
              </span>
              {dict.h1_post ? ` ${dict.h1_post}` : ''}
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-up-delay-2 max-w-[500px] text-lg leading-[1.75] text-brand-muted sm:text-[19px]">
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
                  className={`flex items-center gap-2 text-[15px] font-medium text-brand-muted transition-colors duration-300 hover:text-brand-ink ${
                    isRtl ? 'flex-row-reverse' : ''
                  }`}
                >
                  {dict.cta_secondary}
                  <ChevronDown className="h-4 w-4" />
                </a>
              </div>

              {/* Risk reversal — removes the "what am I signing up for" hesitation */}
              <p className="text-[13px] text-brand-muted/90">{dict.cta_note}</p>
            </div>
          </div>

          {/* ── Visual panel ──────────────────────────────────── */}
          <div className={`animate-fade-in ${isRtl ? 'lg:order-1' : 'lg:order-2'}`}>
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  )
}
