import { MessageCircle, Phone, Mail } from 'lucide-react'
import { getWhatsAppURL } from '@/lib/whatsapp'
import { siteConfig } from '@/lib/config'
import type { Locale } from '@/lib/i18n'
import ContactForm, { type ContactDict } from './ContactForm'

type Props = {
  lang: Locale
  dict: ContactDict & {
    section_title: string
    section_subtitle: string
    next_title: string
    next_steps: string[]
  }
}

export default function Contact({ lang, dict }: Props) {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="section section--band">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          {/* ── Intro + direct channels ─────────────────────────── */}
          <div>
            <h2 id="contact-heading" className="text-brand-ink lg:text-[2.75rem] lg:leading-[1.15]">
              {dict.section_title}
            </h2>
            <p className="mt-4 max-w-md text-base leading-[1.75] text-brand-slate sm:text-[1.0625rem]">
              {dict.section_subtitle}
            </p>

            <div className="mt-8 space-y-3">
              <a
                href={getWhatsAppURL(dict.whatsapp_message)}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics="whatsapp:contact-section"
                className="flex items-center gap-4 border border-brand-line bg-brand-surface p-4 transition-all duration-300 hover:-translate-y-0.5 "
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-successSoft">
                  <MessageCircle className="h-5 w-5 text-brand-success" aria-hidden="true" />
                </span>
                <span className="text-[0.875rem] font-medium text-brand-ink">
                  {dict.or_whatsapp}
                </span>
              </a>

              {siteConfig.phoneDisplay && (
                <a
                  href={`tel:${siteConfig.phoneDial}`}
                  className="flex items-center gap-4 border border-brand-line bg-brand-surface p-4 transition-all duration-300 hover:-translate-y-0.5 "
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-panel ">
                    <Phone className="h-4 w-4 text-brand-ink" aria-hidden="true" />
                  </span>
                  <span className="text-[0.875rem] font-medium text-brand-ink" dir="ltr">
                    {siteConfig.phoneDisplay}
                  </span>
                </a>
              )}

              {siteConfig.email && (
                <a
                  href={`mailto:$<span className="break-all">{siteConfig.email}</span>`}
                  className="flex items-center gap-4 border border-brand-line bg-brand-surface p-4 transition-all duration-300 hover:-translate-y-0.5 "
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-panel ">
                    <Mail className="h-4 w-4 text-brand-ink" aria-hidden="true" />
                  </span>
                  <span className="text-[0.875rem] font-medium text-brand-ink" dir="ltr">
                    <span className="break-all">{siteConfig.email}</span>
                  </span>
                </a>
              )}
            </div>

            <div className="mt-10 border-t border-brand-line pt-8">
              <h3 className="text-[1rem]">{dict.next_title}</h3>
              <ol className="mt-4 space-y-3">
                {dict.next_steps.map((step, i) => (
                  <li
                    key={step}
                    className="flex gap-3 text-[0.875rem] leading-relaxed text-brand-slate"
                  >
                    <span
                      className="num flex-shrink-0 text-[0.875rem] leading-relaxed"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* ── Form ────────────────────────────────────────────── */}
          <ContactForm lang={lang} dict={dict} />
        </div>
      </div>
    </section>
  )
}
