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
  }
}

export default function Contact({ lang, dict }: Props) {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="section">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          {/* ── Intro + direct channels ─────────────────────────── */}
          <div>
            <h2
              id="contact-heading"
              className="text-3xl font-bold tracking-[-0.025em] text-brand-ink sm:text-4xl lg:text-[44px] lg:leading-[1.15]"
            >
              {dict.section_title}
            </h2>
            <p className="mt-4 max-w-md text-base leading-[1.75] text-brand-muted sm:text-[17px]">
              {dict.section_subtitle}
            </p>

            <div className="mt-8 space-y-3">
              <a
                href={getWhatsAppURL(dict.whatsapp_message)}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics="whatsapp:contact-section"
                className="flex items-center gap-4 border border-brand-ink/15 bg-brand-void p-4 transition-all duration-300 hover:-translate-y-0.5 hover:"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-green-500/10">
                  <MessageCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
                </span>
                <span className="text-[14px] font-medium text-brand-ink">{dict.or_whatsapp}</span>
              </a>

              {siteConfig.phoneDisplay && (
                <a
                  href={`tel:${siteConfig.phoneDisplay.replace(/[^\d+]/g, '')}`}
                  className="flex items-center gap-4 border border-brand-ink/15 bg-brand-void p-4 transition-all duration-300 hover:-translate-y-0.5 hover:"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-deep ">
                    <Phone className="h-4 w-4 text-brand-ink" aria-hidden="true" />
                  </span>
                  <span className="text-[14px] font-medium text-brand-ink" dir="ltr">
                    {siteConfig.phoneDisplay}
                  </span>
                </a>
              )}

              {siteConfig.email && (
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-4 border border-brand-ink/15 bg-brand-void p-4 transition-all duration-300 hover:-translate-y-0.5 hover:"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-deep ">
                    <Mail className="h-4 w-4 text-brand-ink" aria-hidden="true" />
                  </span>
                  <span className="text-[14px] font-medium text-brand-ink" dir="ltr">
                    {siteConfig.email}
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* ── Form ────────────────────────────────────────────── */}
          <ContactForm lang={lang} dict={dict} />
        </div>
      </div>
    </section>
  )
}
