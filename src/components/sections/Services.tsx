import { Monitor, Zap, TrendingUp, type LucideIcon } from 'lucide-react'
import { getWhatsAppURL } from '@/lib/whatsapp'

type ServiceItem = {
  id: string
  icon: string
  title: string
  description: string
  features: string[]
  whatsapp_message: string
}

type ServicesDict = {
  section_title: string
  section_subtitle: string
  cta_label: string
  items: ServiceItem[]
}

type Props = {
  lang: 'he' | 'en'
  dict: ServicesDict
}

const iconMap: Record<string, LucideIcon> = {
  Monitor,
  Zap,
  TrendingUp,
}

export default function Services({ lang: _lang, dict }: Props) {
  return (
    <section id="services" className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">

        {/* Section header */}
        <div className="mb-14 text-center lg:mb-20">
          <h2 className="text-3xl font-bold tracking-[-0.025em] text-brand-charcoal sm:text-4xl lg:text-[52px] lg:leading-[1.1]">
            {dict.section_title}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-[1.75] text-brand-steel sm:text-[17px]">
            {dict.section_subtitle}
          </p>
        </div>

        {/* 3-col grid */}
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {dict.items.map((service) => {
            const Icon: LucideIcon = iconMap[service.icon] ?? Monitor

            return (
              <div
                key={service.id}
                className="group relative overflow-hidden rounded-[24px] border border-brand-border bg-brand-cream p-7 shadow-soft transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-2 hover:shadow-card-hover sm:rounded-[28px] sm:p-8"
              >
                {/* Hover fill overlay — rises from bottom */}
                <div
                  className="absolute inset-0 origin-bottom scale-y-0 bg-brand-black transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-y-100"
                  aria-hidden="true"
                />

                {/* Card content */}
                <div className="relative z-10 flex h-full flex-col">

                  {/* Icon */}
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-soft transition-all duration-300 group-hover:bg-white/10 group-hover:shadow-none">
                    <Icon className="h-5 w-5 text-brand-charcoal transition-colors duration-300 group-hover:text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="mb-3 text-[17px] font-bold tracking-[-0.015em] text-brand-charcoal transition-colors duration-300 group-hover:text-white">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="mb-6 text-[14px] leading-relaxed text-brand-steel transition-colors duration-300 group-hover:text-white/65">
                    {service.description}
                  </p>

                  {/* Feature list */}
                  <ul className="mb-8 flex-1 space-y-2.5">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-3 text-[13px] leading-snug text-brand-steel transition-colors duration-300 group-hover:text-white/65"
                      >
                        <span
                          className="h-1 w-1 flex-shrink-0 rounded-full bg-brand-border transition-colors duration-300 group-hover:bg-white/40"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <a
                    href={getWhatsAppURL(service.whatsapp_message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/cta mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold tracking-wide text-brand-charcoal transition-colors duration-300 group-hover:text-white"
                  >
                    {dict.cta_label}
                    <span
                      className="transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover/cta:translate-x-1 rtl:group-hover/cta:-translate-x-1"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
