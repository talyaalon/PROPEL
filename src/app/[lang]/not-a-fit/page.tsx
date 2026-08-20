import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, X } from 'lucide-react'
import { locales, isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { siteConfig } from '@/lib/config'
import { pageMetadata } from '@/lib/pageMetadata'
import { getWhatsAppURL } from '@/lib/whatsapp'
import { breadcrumbSchema } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import { servicePages } from '@/content/services'

/**
 * The page that turns work away.
 *
 * The About section already claims "אומרים גם מה לא כדאי לכם לעשות, גם כשזה
 * מקטין לנו את הפרויקט" - we say what is not worth doing, even when it shrinks
 * our own project. A value asserted on a marketing page costs nothing; this is
 * the page where it is testable.
 *
 * It filters by TYPE of work, never by budget. Every item is derived from a
 * position the site already holds - the SEO card sells organic search, the
 * migration service exists to move people OFF closed platforms, the FAQ commits
 * to 2-3 and 4-6 week timelines - so nothing here is a new claim. Size is
 * deliberately not a filter: the FAQ says one-person businesses are some of the
 * best projects here.
 *
 * `noindex` is deliberately NOT set. A prospect searching "מי לא בונה
 * אפליקציות" is not the visitor this page is for, but a prospect who lands on
 * it and self-selects out has saved both sides a call, which is the point.
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
    path: 'not-a-fit',
    title: dict.not_a_fit.meta_title,
    description: dict.not_a_fit.meta_description,
  })
}

export default async function NotAFitPage({ params }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const t = dict.not_a_fit

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: 'PROPEL', url: `${siteConfig.url}/${lang}` },
          { name: t.h1, url: `${siteConfig.url}/${lang}/not-a-fit` },
        ])}
      />

      <section className="section" aria-labelledby="fit-heading">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-6">
            <span className="clause" aria-hidden="true">
              01
            </span>
            {t.eyebrow}
          </p>
          <h1 id="fit-heading">{t.h1}</h1>
          <p className="lead mt-6">{t.intro}</p>
          <p className="body-text mt-5">{t.body}</p>
        </div>
      </section>

      <section className="section section--band" aria-labelledby="fit-not">
        <div className="mx-auto max-w-3xl">
          <h2 id="fit-not" className="text-brand-ink">
            <span className="clause" aria-hidden="true">
              02
            </span>
            {t.items_title}
          </h2>

          {/* A definition list, not cards: this is a set of terms and what each
              one means, and a reader scanning for their own case wants them in
              one column rather than a grid to sweep. */}
          <dl className="mt-8 flex flex-col gap-7">
            {t.items.map((item) => (
              <div key={item.title} className="flex min-w-0 items-start gap-3">
                <X className="mt-1.5 h-4 w-4 flex-shrink-0 text-brand-accent" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="font-semibold text-brand-ink">{item.title}</dt>
                  <dd className="body-text mt-1.5">{item.body}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section" aria-labelledby="fit-instead">
        <div className="mx-auto max-w-3xl">
          <h2 id="fit-instead" className="text-brand-ink">
            <span className="clause" aria-hidden="true">
              03
            </span>
            {t.instead_title}
          </h2>
          <p className="body-text mt-4">{t.instead_body}</p>
        </div>
      </section>

      <section className="section section--band" aria-labelledby="fit-yes">
        <div className="mx-auto max-w-3xl">
          <h2 id="fit-yes" className="text-brand-ink">
            <span className="clause" aria-hidden="true">
              04
            </span>
            {t.fit_title}
          </h2>
          <p className="lead mt-4">{t.fit_body}</p>

          {/* The services, as the way out of this page. A visitor who read the
              whole list and is still here has qualified themselves. */}
          <ul className="mt-8 flex flex-col gap-3">
            {servicePages.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/${lang}/services/${service.slug}`}
                  className="group flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[1rem] text-brand-ink transition-colors duration-200 hover:text-brand-accent"
                >
                  <ArrowRight
                    className="h-4 w-4 flex-shrink-0 text-brand-accent rtl:-scale-x-100"
                    aria-hidden="true"
                  />
                  <span className="font-semibold">{service.title[lang]}</span>
                  <span className="body-text min-w-0">{service.intro[lang]}</span>
                </Link>
              </li>
            ))}
          </ul>

          <a
            href={getWhatsAppURL(t.whatsapp_message)}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics="whatsapp:not-a-fit"
            className="btn mt-10 inline-flex"
          >
            <Check className="h-[18px] w-[18px]" aria-hidden="true" />
            {t.cta_label}
          </a>
        </div>
      </section>
    </>
  )
}
