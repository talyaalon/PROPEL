import Image from 'next/image'
import { MessageCircle, ChevronDown } from 'lucide-react'
import { getWhatsAppURL } from '@/lib/whatsapp'

type HeroDict = {
  badge: string
  h1_pre: string
  h1_focus: string
  h1_post: string
  subtitle: string
  cta_primary: string
  cta_secondary: string
  whatsapp_message: string
}

type Props = {
  lang: 'he' | 'en'
  dict: HeroDict
  stats?: unknown // accepted for page.tsx compatibility — visual is now image-based
}

const NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")"

export default function Hero({ lang, dict }: Props) {
  const isRtl = lang === 'he'

  return (
    <section className="relative min-h-[calc(100vh-68px)] overflow-hidden bg-brand-cream px-4 py-20 sm:min-h-[calc(100vh-76px)] sm:px-6 lg:px-8 lg:py-32">
      {/* Grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 select-none opacity-[0.028]"
        style={{ backgroundImage: NOISE_SVG, backgroundSize: '300px 300px' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* ── Text column ───────────────────────────────────── */}
          <div className={`flex flex-col gap-7 lg:gap-9 ${isRtl ? 'lg:order-2' : 'lg:order-1'}`}>

            {/* Availability badge */}
            <div className="animate-fade-up inline-flex w-fit items-center gap-2.5 rounded-full border border-brand-border bg-white/80 px-4 py-2 shadow-soft backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>
              <span className="text-[13px] font-medium text-brand-steel">{dict.badge}</span>
            </div>

            {/* H1 */}
            <h1
              className={`animate-fade-up-delay text-[40px] font-extrabold leading-[1.06] tracking-[-0.03em] text-brand-charcoal sm:text-5xl lg:text-[64px] lg:leading-[1.04] ${
                isRtl ? 'font-assistant' : 'font-dm-sans'
              }`}
            >
              {dict.h1_pre}
              {dict.h1_pre ? ' ' : ''}
              {/* Animated underline on focus word */}
              <span className="relative inline-block">
                <span className="relative z-10">{dict.h1_focus}</span>
                <span
                  className={`absolute bottom-1 left-0 h-[3px] w-full rounded-full bg-brand-charcoal/60 animate-underline-grow ${
                    isRtl ? 'underline-rtl' : 'underline-ltr'
                  }`}
                />
              </span>
              {dict.h1_post ? ` ${dict.h1_post}` : ''}
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-up-delay-2 max-w-[480px] text-lg leading-[1.75] text-brand-steel sm:text-[19px]">
              {dict.subtitle}
            </p>

            {/* CTA row */}
            <div className="animate-fade-in flex flex-wrap items-center gap-4 sm:gap-5">
              <a
                href={getWhatsAppURL(dict.whatsapp_message)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-full bg-brand-black px-8 py-4 text-[15px] font-semibold tracking-wide text-white transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(17,17,17,0.28)] active:translate-y-0 active:scale-[0.97] active:shadow-none"
              >
                <MessageCircle className="h-[18px] w-[18px]" />
                {dict.cta_primary}
              </a>
              <a
                href="#services"
                className={`flex items-center gap-2 text-[15px] font-medium text-brand-steel transition-colors duration-300 hover:text-brand-charcoal ${
                  isRtl ? 'flex-row-reverse' : ''
                }`}
              >
                {dict.cta_secondary}
                <ChevronDown className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* ── Visual panel ──────────────────────────────────── */}
          <div className={`animate-fade-in ${isRtl ? 'lg:order-1' : 'lg:order-2'}`}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] bg-brand-border/30 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_24px_64px_rgba(0,0,0,0.08)]">
              <Image
                src="/hero.jpg"
                alt="Business workflow automation"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
