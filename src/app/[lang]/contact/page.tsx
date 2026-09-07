import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, MessageCircle, Phone, Mail } from 'lucide-react'
import { locales, isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { siteConfig } from '@/lib/config'
import { pageMetadata } from '@/lib/pageMetadata'
import { getWhatsAppURL } from '@/lib/whatsapp'
import { breadcrumbSchema, contactPageSchema } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import ContactForm from '@/components/sections/ContactForm'

/**
 * The contact page.
 *
 * /he/contact answered a soft 404 - it is the most guessable URL on a business
 * site after the homepage, it is what a business card and a Google Business
 * Profile point at, and it did not exist.
 *
 * The hard part was building it WITHOUT repeating the homepage. That is not a
 * theoretical concern here: /he/portfolio rendered the same grid as the
 * homepage, measured 89.7% identical, and Search Console lists it as "crawled,
 * currently not indexed". A contact page that is the homepage's contact
 * section again would earn the same verdict.
 *
 * So the form is shared - it is a control, not prose, and there is exactly one
 * of it in the codebase - while everything around it is written for this page
 * and appears nowhere else: which channel suits which situation, what to put
 * in the message, and a link to the page that says when we are the wrong
 * people. The homepage section keeps its own framing and its own copy.
 */

type Props = {
  params: Promise<{ lang: string }>
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = await getDictionary(lang)

  return pageMetadata({
    lang,
    path: 'contact',
    title: dict.contact.page_meta_title,
    description: dict.contact.page_meta_description,
  })
}

export default async function ContactPage({ params }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const t = dict.contact

  return (
    <>
      <JsonLd
        schema={contactPageSchema({
          lang,
          name: t.page_meta_title,
          description: t.page_meta_description,
        })}
      />
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'PROPEL', url: `${siteConfig.url}/${lang}` },
          { name: t.page_h1, url: `${siteConfig.url}/${lang}/contact` },
        ])}
      />

      <section className="section" aria-labelledby="contact-page-heading">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 lg:mb-14">
            <p className="eyebrow mb-6">
              <span className="clause" aria-hidden="true">
                01
              </span>
              {t.page_eyebrow}
            </p>
            <h1 id="contact-page-heading" className="max-w-3xl">
              {t.page_h1}
            </h1>
            <p className="lead mt-5 max-w-2xl">{t.page_lead}</p>
          </div>

          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
            {/* ── Channels, and what each one is good for ─────────────────── */}
            <div>
              <h2 className="text-[1.25rem] font-bold text-brand-ink">{t.channels_title}</h2>
              <ul className="mt-4 space-y-2.5">
                {t.channels.map((channel) => (
                  <li key={channel} className="body-text flex items-start gap-2.5">
                    <Check
                      className="mt-1.5 h-4 w-4 flex-shrink-0 text-brand-accent"
                      aria-hidden="true"
                    />
                    {channel}
                  </li>
                ))}
              </ul>

              <div className="mt-8 space-y-3">
                <a
                  href={getWhatsAppURL(t.whatsapp_message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics="whatsapp:contact-page"
                  className="flex items-center gap-4 border border-brand-line bg-brand-surface p-4 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-successSoft">
                    <MessageCircle className="h-5 w-5 text-brand-success" aria-hidden="true" />
                  </span>
                  <span className="text-[0.875rem] font-medium text-brand-ink">
                    {t.or_whatsapp}
                  </span>
                </a>

                {siteConfig.phoneDisplay && (
                  <a
                    href={`tel:${siteConfig.phoneDial}`}
                    data-analytics="phone:contact-page"
                    className="flex items-center gap-4 border border-brand-line bg-brand-surface p-4 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-panel">
                      <Phone className="h-4 w-4 text-brand-ink" aria-hidden="true" />
                    </span>
                    <span className="text-[0.875rem] font-medium text-brand-ink" dir="ltr">
                      {siteConfig.phoneDisplay}
                    </span>
                  </a>
                )}

                {siteConfig.email && (
                  <a
                    href={`mailto:${siteConfig.email}`}
                    data-analytics="email:contact-page"
                    className="flex items-center gap-4 border border-brand-line bg-brand-surface p-4 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-panel">
                      <Mail className="h-4 w-4 text-brand-ink" aria-hidden="true" />
                    </span>
                    <span className="text-[0.875rem] font-medium text-brand-ink" dir="ltr">
                      <span className="break-all">{siteConfig.email}</span>
                    </span>
                  </a>
                )}
              </div>

              {/* What to put in the message. The homepage says what happens
                  after you send; this says what to send, which is the half a
                  first-time enquirer actually gets wrong. */}
              <div className="mt-10 border-t border-brand-line pt-8">
                <h2 className="text-[1.25rem] font-bold text-brand-ink">{t.include_title}</h2>
                <p className="body-text mt-3">{t.include_body}</p>
                <ul className="mt-4 space-y-2.5">
                  {t.include_items.map((item) => (
                    <li key={item} className="body-text flex items-start gap-2.5">
                      <Check
                        className="mt-1.5 h-4 w-4 flex-shrink-0 text-brand-accent"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* The not-a-fit page had two inbound links, both in the footer.
                  This is the one place a reader is deciding whether to write. */}
              <div className="mt-10 border-t border-brand-line pt-8">
                <h2 className="text-[1.25rem] font-bold text-brand-ink">{t.fit_title}</h2>
                <p className="body-text mt-3">{t.fit_body}</p>
                <Link
                  href={`/${lang}/not-a-fit`}
                  className="group/fit mt-4 inline-flex items-center gap-1.5 py-1.5 font-display text-[0.875rem] font-bold uppercase tracking-[.08em] text-brand-accent transition-colors duration-300 hover:text-brand-ink"
                >
                  {t.fit_link}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover/fit:translate-x-1 rtl:-scale-x-100 rtl:group-hover/fit:-translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>

            {/* ── The form ──────────────────────────────────────────────────
                The same component the homepage renders. There is one contact
                form in this codebase and one set of field names matching
                public/__forms.html, which is what Netlify's build-time form
                detection reads - a second copy would be a second thing to keep
                in step with that file. */}
            <div>
              <ContactForm lang={lang} dict={t} />

              <div className="mt-10 border-t border-brand-line pt-8">
                <h2 className="text-[1rem] font-bold text-brand-ink">{t.next_title}</h2>
                <ol className="mt-4 space-y-3">
                  {t.next_steps.map((step, index) => (
                    <li
                      key={step}
                      className="flex gap-3 text-[0.875rem] leading-relaxed text-brand-slate"
                    >
                      <span
                        className="num flex-shrink-0 text-[0.875rem] leading-relaxed"
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
