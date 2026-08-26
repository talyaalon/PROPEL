import {
  ArrowRight,
  Boxes,
  Check,
  Code2,
  Monitor,
  TrendingUp,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { getWhatsAppURL } from '@/lib/whatsapp'
import { getServicePage } from '@/content/services'
import type { Locale } from '@/lib/i18n'
import FeaturedServiceCard, { type ServiceItem } from './FeaturedServiceCard'

type ServicesDict = {
  eyebrow: string
  section_title: string
  section_subtitle: string
  cta_label: string
  stack_label: string
  read_more: string
  items: ServiceItem[]
}

/*
 * Card id -> the /services/<slug> page that makes the same argument at full
 * length. Measured on production: those pages were reachable only from the
 * footer, so a visitor at the "what exactly do you do" stage was offered one
 * action from these cards - open WhatsApp - and no smaller step.
 *
 * Three of the four standard cards. `seo` has no page of its own, and
 * `/services/ecommerce` has no card - it is reached from the footer and from
 * the J-Cafe case study. Neither gets an invented link here.
 */
const servicePageByCard: Record<string, string> = {
  webdev: 'websites',
  automation: 'automation',
  systems: 'management-systems',
}

type Props = {
  /** Section clause number, computed by the page. */
  clause?: string
  lang: Locale
  dict: ServicesDict
}

export const serviceIcons: Record<string, LucideIcon> = {
  Monitor,
  Zap,
  TrendingUp,
  Code2,
  Boxes,
}

export default function Services({ lang, dict, clause }: Props) {
  // A featured service gets its own full-width card below the grid rather than
  // competing for a column with the standard ones.
  const standard = dict.items.filter((item) => !item.featured)
  const featured = dict.items.filter((item) => item.featured)

  return (
    <section id="services" aria-labelledby="services-heading" className="section">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-9 lg:mb-16">
          <p className="eyebrow mb-6">
            {clause && (
              <span className="clause" aria-hidden="true">
                {clause}
              </span>
            )}
            {dict.eyebrow}
          </p>
          <h2 id="services-heading" className="max-w-3xl text-brand-ink">
            {dict.section_title}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-[1.75] text-brand-slate sm:text-[1.1875rem]">
            {dict.section_subtitle}
          </p>
        </div>

        {/* Standard services */}
        {/* Two columns at lg, not three: there are four standard services
            now, and a fourth item in a 3-column grid leaves an empty cell -
            the defect the portfolio grid already had to fix. Half-width also
            gives the systems card the room its six-item stack needs. */}
        <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
          {standard.map((service) => {
            const Icon = serviceIcons[service.icon] ?? Monitor
            /*
             * Resolved, not assumed. A renamed service slug would otherwise
             * render a link to a route that `dynamicParams = false` turns into
             * a 404 - silently, because nothing type-checks a string against
             * the page list. An unknown slug now simply renders no link.
             */
            const servicePage = getServicePage(servicePageByCard[service.id] ?? '')

            return (
              <div key={service.id} className="card flex min-w-0 flex-col">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center border border-brand-line">
                  <Icon className="h-5 w-5 text-brand-accent" />
                </div>

                <h3 className="mb-3">{service.title}</h3>

                <p className="mb-6 text-[0.875rem] leading-relaxed text-brand-slate">
                  {service.description}
                </p>

                {/* Outcomes - what the client gets, not which framework we use */}
                <ul className="mb-7 flex-1 grid gap-x-6 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-1">
                  {service.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="flex items-start gap-2.5 text-[0.875rem] leading-snug text-brand-ink"
                    >
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-accent"
                        aria-hidden="true"
                      />
                      {outcome}
                    </li>
                  ))}
                </ul>

                {/* Tech stack - demoted to a footnote, where it belongs */}
                <div className="mb-6">
                  <p className="mb-2 font-display text-[0.75rem] font-semibold uppercase tracking-[.18em] text-brand-slate">
                    {dict.stack_label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {service.stack.map((tech) => (
                      <span key={tech} className="tag" dir="auto">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/*
                  The primary CTA is LAST, so it is the line that aligns
                  across the row. With it first and bottom-anchored, the SEO
                  card - the one with no page of its own to link to - put its
                  accent CTA on the same baseline as its neighbour's grey
                  secondary link, with a 41px void above it.
                */}
                <div className="mt-auto flex flex-col items-start gap-2">
                  {servicePage && (
                    <Link
                      href={`/${lang}/services/${servicePage.slug}`}
                      className="inline-flex items-center gap-1.5 py-1.5 text-[0.875rem] font-medium text-brand-slate transition-colors duration-300 hover:text-brand-ink"
                    >
                      {dict.read_more}
                      <span className="sr-only"> - {service.title}</span>
                      <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden="true" />
                    </Link>
                  )}

                  <a
                    href={getWhatsAppURL(service.whatsapp_message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-analytics={`whatsapp:service-${service.id}`}
                    className="group/cta inline-flex items-center gap-1.5 py-1.5 font-display text-[0.875rem] font-bold uppercase tracking-[.08em] text-brand-accent transition-colors duration-500 ease-smooth hover:text-brand-ink"
                  >
                    {dict.cta_label}
                    {/*
                      An icon, not the literal → character. Chakra Petch has no
                      U+2192, so the cascade fell through to Heebo and pulled two
                      symbol subsets - 37KB on every page in both locales, to
                      render three arrows. lucide is already a dependency and
                      already draws this exact arrow in the case-study footer.
                    */}
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-500 ease-smooth group-hover/cta:translate-x-1 rtl:-scale-x-100 rtl:group-hover/cta:-translate-x-1"
                      aria-hidden="true"
                    />
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        {/* Featured service - spans the full grid width beneath the standard three */}
        {featured.map((service) => (
          <FeaturedServiceCard
            key={service.id}
            service={service}
            stackLabel={dict.stack_label}
            href={service.id === 'migration' ? `/${lang}/services/migration` : undefined}
          />
        ))}
      </div>
    </section>
  )
}
