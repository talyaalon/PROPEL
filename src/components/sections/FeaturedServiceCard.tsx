import { Monitor, Code2, Check, type LucideIcon } from 'lucide-react'
import { getWhatsAppURL } from '@/lib/whatsapp'

export type ServiceItem = {
  id: string
  icon: string
  title: string
  description: string
  outcomes: string[]
  stack: string[]
  whatsapp_message: string
  /** Renders in the wide card below the grid instead of as a grid column. */
  featured?: boolean
  /** Small accent label, e.g. "NEW". Only used by the featured card. */
  badge?: string
  /** Heading above the outcomes column. Only used by the featured card. */
  features_label?: string
  cta_label?: string
  /** Overrides the derived analytics location when the id alone is not descriptive. */
  analytics?: string
}

const iconMap: Record<string, LucideIcon> = {
  Monitor,
  Code2,
}

type Props = {
  service: ServiceItem
  stackLabel: string
}

/**
 * The wide service card.
 *
 * Three columns at desktop — pitch, outcomes, stack + CTA — collapsing to a
 * single column below `lg`. The outcome list is the reason for the extra width:
 * eight items would make a standard card twice the height of its neighbours,
 * while here they sit two-up and the row stays balanced.
 */
export default function FeaturedServiceCard({ service, stackLabel }: Props) {
  const Icon = iconMap[service.icon] ?? Code2

  return (
    <div className="card mt-5 sm:mt-6 lg:col-span-3">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1.4fr_0.9fr] lg:gap-12">
        {/* ── Pitch ─────────────────────────────────────────────────────── */}
        <div>
          <div className="mb-6 flex items-center gap-4">
            <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center border border-brand-line">
              <Icon className="h-5 w-5 text-brand-accent" />
            </span>
            {service.badge && (
              <span className="inline-flex items-center bg-brand-accent px-2.5 py-1 font-display text-[0.6875rem] font-bold uppercase tracking-[.1em] text-brand-surface">
                {service.badge}
              </span>
            )}
          </div>

          <h3 className="mb-4">{service.title}</h3>

          <p className="text-[0.9375rem] leading-[1.75] text-brand-slate">{service.description}</p>
        </div>

        {/* ── Outcomes ──────────────────────────────────────────────────── */}
        <div>
          {service.features_label && (
            <p className="mb-4 font-display text-[0.625rem] font-semibold uppercase tracking-[.18em] text-brand-slate">
              {service.features_label}
            </p>
          )}

          <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {service.outcomes.map((outcome) => (
              <li
                key={outcome}
                className="flex items-start gap-2.5 text-[0.8125rem] leading-snug text-brand-ink"
              >
                <Check
                  className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-accent"
                  aria-hidden="true"
                />
                {outcome}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Stack + CTA ───────────────────────────────────────────────── */}
        <div className="flex flex-col">
          <p className="mb-2 font-display text-[0.625rem] font-semibold uppercase tracking-[.18em] text-brand-slate">
            {stackLabel}
          </p>

          <div className="mb-8 flex flex-wrap gap-1.5">
            {service.stack.map((tech) => (
              <span key={tech} className="tag">
                {tech}
              </span>
            ))}
          </div>

          <a
            href={getWhatsAppURL(service.whatsapp_message)}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics={service.analytics ?? `whatsapp:service-${service.id}`}
            className="btn mt-auto w-full"
          >
            {service.cta_label}
          </a>
        </div>
      </div>
    </div>
  )
}
