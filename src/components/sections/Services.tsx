import { Monitor, Zap, TrendingUp, Code2, Check, type LucideIcon } from 'lucide-react'
import { getWhatsAppURL } from '@/lib/whatsapp'
import FeaturedServiceCard, { type ServiceItem } from './FeaturedServiceCard'

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

export const serviceIcons: Record<string, LucideIcon> = {
  Monitor,
  Zap,
  TrendingUp,
  Code2,
}

export default function Services({ dict }: Props) {
  // A featured service gets its own full-width card below the grid rather than
  // competing for a column with the standard three.
  const standard = dict.items.filter((item) => !item.featured)
  const featured = dict.items.filter((item) => item.featured)

  return (
    <section id="services" aria-labelledby="services-heading" className="section">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-14 lg:mb-20">
          <p className="eyebrow mb-6">Services</p>
          <h2 id="services-heading" className="max-w-3xl">
            {dict.section_title}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-[1.75] text-brand-slate sm:text-[17px]">
            {dict.section_subtitle}
          </p>
        </div>

        {/* Standard services */}
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {standard.map((service) => {
            const Icon = serviceIcons[service.icon] ?? Monitor

            return (
              <div key={service.id} className="card flex flex-col">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center border border-brand-line">
                  <Icon className="h-5 w-5 text-brand-accent" />
                </div>

                <h3 className="mb-3">{service.title}</h3>

                <p className="mb-6 text-[14px] leading-relaxed text-brand-slate">
                  {service.description}
                </p>

                {/* Outcomes — what the client gets, not which framework we use */}
                <ul className="mb-7 flex-1 space-y-2.5">
                  {service.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="flex items-start gap-2.5 text-[13px] leading-snug text-brand-ink"
                    >
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-accent"
                        aria-hidden="true"
                      />
                      {outcome}
                    </li>
                  ))}
                </ul>

                {/* Tech stack — demoted to a footnote, where it belongs */}
                <div className="mb-6">
                  <p className="mb-2 font-display text-[10px] font-semibold uppercase tracking-[.18em] text-brand-slate">
                    {dict.stack_label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {service.stack.map((tech) => (
                      <span key={tech} className="tag">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href={getWhatsAppURL(service.whatsapp_message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics={`whatsapp:service-${service.id}`}
                  className="group/cta mt-auto inline-flex items-center gap-1.5 font-display text-[13px] font-bold uppercase tracking-[.08em] text-brand-accent transition-colors duration-500 ease-smooth hover:text-brand-ink"
                >
                  {dict.cta_label}
                  <span
                    className="transition-transform duration-500 ease-smooth group-hover/cta:translate-x-1 rtl:-scale-x-100"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </a>
              </div>
            )
          })}
        </div>

        {/* Featured service — spans the full grid width beneath the standard three */}
        {featured.map((service) => (
          <FeaturedServiceCard key={service.id} service={service} stackLabel={dict.stack_label} />
        ))}
      </div>
    </section>
  )
}
