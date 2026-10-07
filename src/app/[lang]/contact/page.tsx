import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, MessageCircle, Phone, Mail } from 'lucide-react'
import { locales, isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { siteConfig } from '@/lib/config'
import { pageMetadata } from '@/lib/pageMetadata'
import { getWhatsAppURL } from '@/lib/whatsapp'
import { breadcrumbSchema, contactPageSchema, faqSchema } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import ContactForm from '@/components/sections/ContactForm'
import { getProjects, projectTitle } from '@/content/projects'

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
 *
 * ── The /en/contact expansion ────────────────────────────────────────────────
 *
 * Search Console still reported /en/contact as "crawled, currently not
 * indexed". The page was honest and specific and it was also short, and the
 * English half of a bilingual site is the half with no inbound links from
 * anywhere off it - so thin plus unlinked is the combination Google declines.
 *
 * Five blocks were added below the form, and the two locales are PARALLEL IN
 * STRUCTURE AND INDEPENDENT IN WORDING rather than translations of each
 * other. That is not a stylistic preference: the English reader is as likely
 * to be abroad as in Israel, so the time-zone arithmetic and the
 * language-of-work line carry weight on /en that they do not carry on /he,
 * and the Hebrew page leads with the things a local caller asks instead.
 *
 * Every claim here is one the site already makes somewhere: twenty minutes
 * and no commitment (hero), one business day (contact section), 2-3 weeks and
 * 4-6 weeks and the ownership answer (homepage FAQ), six branches in Thailand
 * (the J-Cafe case study), Netlify Forms and no third party (privacy policy).
 * Nothing about response times beyond "one business day" is asserted, because
 * nothing else has been measured - see TODO(owner) on `response_body`.
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

  /*
   * Three case studies to read before the call: a store, a public site and an
   * internal system, which is the whole range in three links.
   *
   * Named here rather than taken off the top of `getProjects()`, for the same
   * reason the migration page names its two: the sort order is featured-first
   * and then by year, so "the first three" is a list that silently changes
   * when a project gains a `featured` flag - and this block is one of the few
   * editorial inbound links the case studies have.
   *
   * Filtered through `getProjects()`, so a project that becomes a draft drops
   * out of the list instead of linking at a URL the middleware 404s.
   */
  const readingList = ['jcafe-kosher', 'hagorer2', 'air-manage']
  const reading = getProjects().filter((project) => readingList.includes(project.slug))

  return (
    <>
      <JsonLd
        schema={contactPageSchema({
          lang,
          name: t.page_meta_title,
          description: t.page_meta_description,
        })}
      />
      {/* The page's own FAQ, as structured data. One FAQPage block per page is
          the limit `scripts/seo-audit.mjs` enforces, and this route had none -
          the homepage's block is on the homepage. Every answer below is
          rendered as visible page text in the section at the bottom; schema
          describing content a page does not show is a violation. */}
      <JsonLd schema={faqSchema(t.faq_items)} />
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

              {/* What the work looks like when it is ours. Directly above the
                  "before you write" block, because the two halves of one
                  question read badly when they are a screen apart: a visitor
                  weighing whether to send anything wants both answers in the
                  same glance. */}
              <div className="mt-10 border-t border-brand-line pt-8">
                <h2 className="text-[1.25rem] font-bold text-brand-ink">{t.fit_yes_title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {t.fit_yes_items.map((item) => (
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

      {/* ── The intro call ─────────────────────────────────────────────────
          The homepage's `next_steps` says a short call happens. It does not
          say what is in one, which is the thing that actually stops a
          first-time enquirer from booking. */}
      <section className="section section--band" aria-labelledby="contact-call">
        <div className="mx-auto max-w-3xl">
          <h2 id="contact-call" className="text-brand-ink">
            {t.call_title}
          </h2>
          <p className="body-text mt-4">{t.call_body}</p>
          <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {t.call_items.map((item) => (
              <li key={item} className="body-text flex items-start gap-2.5">
                <Check
                  className="mt-1 h-4 w-4 flex-shrink-0 text-brand-accent"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── What arrives, and when ─────────────────────────────────────────
          Two blocks rather than one. What you get is a list of deliverables;
          when you get it is a list of constraints, and merging them produced
          a nine-item list in which the time-zone lines read as promises
          about scope. */}
      <section className="section" aria-labelledby="contact-deliver">
        <div className="mx-auto max-w-3xl">
          <h2 id="contact-deliver" className="text-brand-ink">
            {t.deliver_title}
          </h2>
          <p className="body-text mt-4">{t.deliver_body}</p>
          <ul className="mt-8 flex flex-col gap-4">
            {t.deliver_items.map((item) => (
              <li key={item} className="body-text flex items-start gap-2.5">
                <Check
                  className="mt-1 h-4 w-4 flex-shrink-0 text-brand-accent"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-12 border-t border-brand-line pt-10">
            <h2 className="text-brand-ink">{t.response_title}</h2>
            {/*
              TODO(owner): this says one business day and states the offset
              between the two time zones, and deliberately says nothing about
              working hours - "we answer between 9 and 18" is a number nobody
              has given, and a published hour the business does not keep is the
              first promise a visitor catches us breaking. Send the hours you
              actually want published and they go in here.
            */}
            <p className="body-text mt-4">{t.response_body}</p>
            <ul className="mt-6 flex flex-col gap-3">
              {t.response_items.map((item) => (
                <li key={item} className="body-text flex items-start gap-2.5">
                  <Check
                    className="mt-1 h-4 w-4 flex-shrink-0 text-brand-accent"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Out of the page ────────────────────────────────────────────────
          The contact page's own outbound links. It had exactly one editorial
          link, to /not-a-fit, so a reader who was not ready to write had
          nowhere to go but the navigation - and the English service pages and
          case studies had one fewer inbound editorial link each than they
          needed. `scripts/inlinks.mjs` counts links from inside another
          page's <main>, which is what these are. */}
      <section className="section section--band" aria-labelledby="contact-reading">
        <div className="mx-auto max-w-3xl">
          <h2 id="contact-reading" className="text-brand-ink">
            {t.work_title}
          </h2>
          <p className="body-text mt-4">{t.work_body}</p>

          <ul className="mt-8 flex flex-col gap-4">
            <li>
              <Link
                href={`/${lang}/services`}
                className="card flex flex-wrap items-baseline gap-3 p-5"
              >
                <ArrowRight
                  className="h-4 w-4 flex-shrink-0 text-brand-accent rtl:-scale-x-100"
                  aria-hidden="true"
                />
                <span className="font-semibold text-brand-ink">{dict.services.hub_title}</span>
                <span className="body-text">{dict.services.hub_subtitle}</span>
              </Link>
            </li>
            {reading.map((project) => (
              <li key={project.slug}>
                <Link
                  href={`/${lang}/portfolio/${project.slug}`}
                  className="card flex flex-wrap items-baseline gap-3 p-5"
                >
                  <ArrowRight
                    className="h-4 w-4 flex-shrink-0 text-brand-accent rtl:-scale-x-100"
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-brand-ink">
                    {projectTitle(project, lang)}
                  </span>
                  <span className="body-text">{project.summary[lang]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── The FAQ ────────────────────────────────────────────────────────
          Visible h3/p, not a collapsed accordion: these are the paragraphs the
          FAQPage block above declares, and the rule is that an answer exists
          as page text. The homepage FAQ answers what a project costs and how
          long it takes; these answer the narrower question this page is for -
          what happens when you press send. */}
      <section className="section" aria-labelledby="contact-faq">
        <div className="mx-auto max-w-3xl">
          <h2 id="contact-faq" className="text-brand-ink">
            {t.faq_title}
          </h2>
          <div className="mt-8 divide-y divide-brand-line border-t border-brand-line">
            {t.faq_items.map((item) => (
              <div key={item.question} className="py-6">
                {/* min-w-0 + break-words: a question is one long unbreakable
                    run in neither language, but the answers name `Netlify
                    Forms` and the 200% text size turns any Latin token into a
                    reflow candidate. Cheap, and this project's most recurring
                    defect. */}
                <h3 className="min-w-0 break-words text-[1.0625rem] font-bold text-brand-ink">
                  {item.question}
                </h3>
                <p className="body-text mt-3">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
