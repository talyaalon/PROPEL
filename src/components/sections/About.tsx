import { Target, Zap, Shield, MessageCircle, type LucideIcon } from 'lucide-react'
import { getWhatsAppURL } from '@/lib/whatsapp'

type Value = {
  icon: string
  title: string
  description: string
}

type AboutDict = {
  eyebrow: string
  section_title: string
  section_subtitle: string
  paragraphs: string[]
  values: Value[]
  cta_label: string
  whatsapp_message: string
}

type Props = {
  /** Section clause number, computed by the page. */
  clause?: string
  dict: AboutDict
}

const iconMap: Record<string, LucideIcon> = {
  Target,
  Zap,
  Shield,
}

export default function About({ dict, clause }: Props) {
  return (
    <section id="about" aria-labelledby="about-heading" className="section section--band">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          {/* ── Text column ─────────────────────────────────────
              No order override. `order` is already direction-aware inside an
              RTL grid, so the ternary that used to be here reversed a reversal
              and left About as the only section on the page that did not
              mirror in Hebrew. Source order alone is correct. */}
          <div className="flex min-w-0 flex-col gap-7">
            {/* The shared `.eyebrow`, not a hand-rolled one. This section had
                its own approximation - different size, different tracking, no
                accent rule - which is part of why the page read as one section
                that was designed and five that were assembled. */}
            <p className="eyebrow mb-1">
              {clause && (
                <span className="clause" aria-hidden="true">
                  {clause}
                </span>
              )}
              {dict.eyebrow}
            </p>

            {/* Heading */}
            <h2 id="about-heading" className="text-brand-ink lg:text-[3.25rem] lg:leading-[1.1]">
              {dict.section_title}
            </h2>

            {/* Body paragraphs */}
            <div className="flex min-w-0 flex-col gap-5">
              {dict.paragraphs.map((paragraph, i) => (
                <p key={i} className="text-[1rem] leading-[1.8] text-brand-slate">
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
              className="inline-flex w-fit items-center gap-2.5 rounded-full btn"
            >
              <MessageCircle className="h-[18px] w-[18px]" />
              {dict.cta_label}
            </a>
          </div>

          {/* ── Values column ─────────────────────────────────── */}
          <div className="flex min-w-0 flex-col gap-4">
            {dict.values.map((value) => {
              const Icon: LucideIcon = iconMap[value.icon] ?? Target

              return (
                <div
                  key={value.title}
                  className="flex items-start gap-5 border border-brand-line bg-brand-surface p-6 transition-all duration-500 ease-smooth hover:-translate-y-1  sm:gap-6"
                >
                  {/* Icon box */}
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-panel ">
                    <Icon className="h-5 w-5 text-brand-ink" />
                  </div>

                  {/* Text */}
                  <div className="min-w-0">
                    <h3 className="mb-1.5 text-[1rem] font-bold text-brand-ink">{value.title}</h3>
                    <p className="text-[0.875rem] leading-relaxed text-brand-slate">
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
