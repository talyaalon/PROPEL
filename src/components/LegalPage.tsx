import { siteConfig } from '@/lib/config'
import type { Locale } from '@/lib/i18n'
import type { LegalDocument } from '@/content/legal'

type Props = {
  lang: Locale
  doc: LegalDocument
  /** Rendered under the last section — used for the accessibility coordinator block. */
  contactBlock?: { heading: string; lines: string[] }
}

export default function LegalPage({ lang, doc, contactBlock }: Props) {
  const formattedDate = new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(siteConfig.legalUpdated))

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <h1 className="text-3xl font-bold tracking-[-0.025em] text-brand-charcoal sm:text-4xl lg:text-5xl">
        {doc.title}
      </h1>

      <p className="mt-3 text-[13px] text-brand-steel">
        {doc.updatedLabel}: <time dateTime={siteConfig.legalUpdated}>{formattedDate}</time>
      </p>

      <p className="mt-8 text-[17px] leading-[1.8] text-brand-charcoal">{doc.intro}</p>

      <div className="mt-12 space-y-10">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-4 text-[19px] font-bold tracking-[-0.015em] text-brand-charcoal">
              {section.heading}
            </h2>

            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mb-3 text-[16px] leading-[1.8] text-brand-steel">
                {paragraph}
              </p>
            ))}

            {section.list && (
              <ul className="space-y-2.5">
                {section.list.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[16px] leading-[1.7] text-brand-steel"
                  >
                    <span
                      className="mt-2.5 h-1 w-1 flex-shrink-0 rounded-full bg-brand-steel"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {contactBlock && (
          <section className="rounded-[20px] border border-brand-border bg-white p-6 sm:p-7">
            <h2 className="mb-4 text-[19px] font-bold tracking-[-0.015em] text-brand-charcoal">
              {contactBlock.heading}
            </h2>
            <ul className="space-y-2">
              {contactBlock.lines.map((line) => (
                <li key={line} className="text-[16px] leading-[1.7] text-brand-steel">
                  {line}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  )
}
