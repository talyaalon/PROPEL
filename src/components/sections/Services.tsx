import { Monitor, Zap, TrendingUp, Check, type LucideIcon } from 'lucide-react'
import { getWhatsAppURL } from '@/lib/whatsapp'

type ServiceItem = {
  id: string
  icon: string
  title: string
  description: string
  outcomes: string[]
  stack: string[]
  whatsapp_message: string
}

type ServicesDict = {
  section_title: string
  section_subtitle: string
  cta_label: string
  stack_label: string
  items: ServiceItem[]
}

type Props = {
  dict: ServicesDict
}

const iconMap: Record<string, LucideIcon> = {
  Monitor,
  Zap,
  TrendingUp,
}

export default function Services({ dict }: Props) {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">

        {/* Section header */}
        <div className="mb-14 text-center lg:mb-20">
          <h2
            id="services-heading"
            className="text-3xl font-bold tracking-[-0.025em] text-brand-charcoal sm:text-4xl lg:text-[52px] lg:leading-[1.1]"
          >
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
                className="group relative overflow-hidden rounded-[24px] border border-brand-border bg-brand-cream p-7 shadow-soft transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-2 hover:shadow-card-hover focus-within:-translate-y-2 focus-within:shadow-card-hover sm:rounded-[28px] sm:p-8"
              >
                {/* Hover fill overlay — rises from bottom. focus-within mirrors it for keyboard users. */}
                <div
                  className="absolute inset-0 origin-bottom scale-y-0 bg-brand-black transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-y-100 group-focus-within:scale-y-100"
                  aria-hidden="true"
                />

                {/* Card content */}
                <div className="relative z-10 flex h-full flex-col">

                  {/* Icon */}
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-soft transition-all duration-300 group-hover:bg-white/10 group-hover:shadow-none group-focus-within:bg-white/10 group-focus-within:shadow-none">
                    <Icon className="h-5 w-5 text-brand-charcoal transition-colors duration-300 group-hover:text-white group-focus-within:text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="mb-3 text-[17px] font-bold tracking-[-0.015em] text-brand-charcoal transition-colors duration-300 group-hover:text-white group-focus-within:text-white">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="mb-6 text-[14px] leading-relaxed text-brand-steel transition-colors duration-300 group-hover:text-white/70 group-focus-within:text-white/70">
                    {service.description}
                  </p>

                  {/* Outcomes — what the client gets, not which framework we use */}
                  <ul className="mb-7 flex-1 space-y-2.5">
                    {service.outcomes.map((outcome) => (
                      <li
                        key={outcome}
                        className="flex items-start gap-2.5 text-[13px] leading-snug text-brand-steel transition-colors duration-300 group-hover:text-white/70 group-focus-within:text-white/70"
                      >
                        <Check
                          className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-charcoal/40 transition-colors duration-300 group-hover:text-white/50 group-focus-within:text-white/50"
                          aria-hidden="true"
                        />
                        {outcome}
                      </li>
                    ))}
                  </ul>

                  {/* Tech stack — demoted to a footnote, where it belongs */}
                  <div className="mb-6">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-steel/70 transition-colors duration-300 group-hover:text-white/45 group-focus-within:text-white/45">
                      {dict.stack_label}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {service.stack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-brand-border bg-white px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-brand-steel transition-colors duration-300 group-hover:border-white/15 group-hover:bg-white/10 group-hover:text-white/70 group-focus-within:border-white/15 group-focus-within:bg-white/10 group-focus-within:text-white/70"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <a
                    href={getWhatsAppURL(service.whatsapp_message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-analytics={`whatsapp:service-${service.id}`}
                    className="group/cta mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold tracking-wide text-brand-charcoal transition-colors duration-300 group-hover:text-white group-focus-within:text-white"
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
