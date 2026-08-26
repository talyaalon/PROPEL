import { siteConfig } from '@/lib/config'
import type { Locale } from '@/lib/i18n'
import type { LegalDocument } from '@/content/legal'

/**
 * One row of the contact card. `href` makes the value actionable - the page
 * exists for someone who has already hit a barrier, and asking them to retype
 * a phone number is the wrong thing to ask.
 */
export type LegalContactLine = {
  label: string
  value: string
  href?: string
  /** Latin digit runs reorder inside a Hebrew line without this. */
  dir?: 'ltr'
}

type Props = {
  lang: Locale
  doc: LegalDocument
  /** Rendered under the last section — used for the accessibility enquiries block. */
  contactBlock?: { heading: string; lines: LegalContactLine[] }
}

export default function LegalPage({ lang, doc, contactBlock }: Props) {
  // timeZone pinned for the same reason as BlogGrid: a date-only string is
  // UTC midnight, and unpinned it renders as yesterday west of UTC.
  const formattedDate = new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(siteConfig.legalUpdated))

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <h1 className="text-brand-ink">{doc.title}</h1>

      <p className="mt-3 text-[0.875rem] text-brand-slate">
        {doc.updatedLabel}: <time dateTime={siteConfig.legalUpdated}>{formattedDate}</time>
      </p>

      <p className="mt-8 text-[1.1875rem] leading-[1.8] text-brand-ink">{doc.intro}</p>

      <div className="mt-12 space-y-10">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-4 text-[1.1875rem] font-bold text-brand-ink">{section.heading}</h2>

            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mb-3 text-[1rem] leading-[1.8] text-brand-slate">
                {paragraph}
              </p>
            ))}

            {section.list && (
              <ul className="space-y-2.5">
                {section.list.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[1rem] leading-[1.7] text-brand-slate"
                  >
                    <span
                      className="mt-2.5 h-1 w-1 flex-shrink-0 rounded-full bg-brand-slate"
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
          <section className="card p-6 sm:p-7">
            <h2 className="mb-4 text-[1.1875rem] font-bold text-brand-ink">
              {contactBlock.heading}
            </h2>
            <ul className="space-y-2">
              {contactBlock.lines.map((line) => (
                <li key={line.label} className="text-[1rem] leading-[1.7] text-brand-slate">
                  {line.label}:{' '}
                  {line.href ? (
                    <a
                      href={line.href}
                      dir={line.dir}
                      className="inline-block py-1 font-medium text-brand-ink underline underline-offset-4 transition-colors duration-300 hover:text-brand-accent"
                    >
                      <span className="break-all">{line.value}</span>
                    </a>
                  ) : (
                    <span dir={line.dir} className="text-brand-ink">
                      {line.value}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  )
}
