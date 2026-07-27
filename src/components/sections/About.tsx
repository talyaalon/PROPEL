import { Target, Zap, Shield, MessageCircle, type LucideIcon } from 'lucide-react'
import { getWhatsAppURL } from '@/lib/whatsapp'
import type { Locale } from '@/lib/i18n'

type Value = {
  icon: string
  title: string
  description: string
}

type AboutDict = {
  section_title: string
  section_subtitle: string
  paragraphs: string[]
  values: Value[]
  cta_label: string
  whatsapp_message: string
}

type Props = {
  lang: Locale
  dict: AboutDict
}

const iconMap: Record<string, LucideIcon> = {
  Target,
  Zap,
  Shield,
}

export default function About({ lang, dict }: Props) {
  const isRtl = lang === 'he'

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* ── Text column ───────────────────────────────────── */}
          {/* RTL: text reads right-to-left so it sits in the second visual column */}
          <div className={`flex flex-col gap-7 ${isRtl ? 'lg:order-2' : 'lg:order-1'}`}>
            {/* Eyebrow — full-strength steel; at 60% opacity this failed WCAG AA on white */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-steel">
              {dict.section_subtitle}
            </p>

            {/* Heading */}
            <h2
              id="about-heading"
              className="text-3xl font-bold tracking-[-0.025em] text-brand-charcoal sm:text-4xl lg:text-[52px] lg:leading-[1.1]"
            >
              {dict.section_title}
            </h2>

            {/* Body paragraphs */}
            <div className="flex flex-col gap-5">
              {dict.paragraphs.map((paragraph, i) => (
                <p key={i} className="text-[16px] leading-[1.8] text-brand-steel">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* CTA */}
            <a
              href={getWhatsAppURL(dict.whatsapp_message)}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics="whatsapp:about"
              className="inline-flex w-fit items-center gap-2.5 rounded-full bg-brand-black px-8 py-4 text-[15px] font-semibold tracking-wide text-white transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(17,17,17,0.28)] active:translate-y-0 active:scale-[0.97] active:shadow-none"
            >
              <MessageCircle className="h-[18px] w-[18px]" />
              {dict.cta_label}
            </a>
          </div>

          {/* ── Values column ─────────────────────────────────── */}
          <div className={`flex flex-col gap-4 ${isRtl ? 'lg:order-1' : 'lg:order-2'}`}>
            {dict.values.map((value) => {
              const Icon: LucideIcon = iconMap[value.icon] ?? Target

              return (
                <div
                  key={value.title}
                  className="flex items-start gap-5 rounded-[20px] border border-brand-border bg-brand-cream p-6 shadow-soft transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-1 hover:shadow-card sm:gap-6"
                >
                  {/* Icon box */}
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-soft">
                    <Icon className="h-5 w-5 text-brand-charcoal" />
                  </div>

                  {/* Text */}
                  <div className="min-w-0">
                    <h3 className="mb-1.5 text-[15px] font-bold tracking-[-0.01em] text-brand-charcoal">
                      {value.title}
                    </h3>
                    <p className="text-[13px] leading-relaxed text-brand-steel">
                      {value.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
