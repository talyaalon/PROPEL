import { Plus } from 'lucide-react'

type FaqItem = {
  question: string
  answer: string
}

type FaqDict = {
  eyebrow: string
  section_title: string
  section_subtitle: string
  items: FaqItem[]
}

/**
 * Built on native <details>/<summary>: keyboard accessible, screen-reader
 * friendly and searchable by the browser's find-in-page, with no JavaScript.
 * The same content feeds the FAQPage structured data on the homepage.
 */
export default function Faq({ dict, clause }: { dict: FaqDict; clause?: string }) {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="section">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col items-center text-center lg:mb-14">
          <p className="eyebrow mb-6">
            {clause && (
              <span className="clause" aria-hidden="true">
                {clause}
              </span>
            )}
            {dict.eyebrow}
          </p>
          <h2 id="faq-heading" className="text-brand-ink lg:text-[2.75rem] lg:leading-[1.15]">
            {dict.section_title}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-[1.75] text-brand-slate sm:text-[1.1875rem]">
            {dict.section_subtitle}
          </p>
        </div>

        <div className="divide-y divide-brand-line border border-brand-line bg-brand-panel">
          {dict.items.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 p-6 text-start transition-colors duration-200 hover:bg-brand-surface sm:p-7 [&::-webkit-details-marker]:hidden">
                <h3 className="text-[1rem] font-bold text-brand-ink sm:text-[1.1875rem]">
                  {item.question}
                </h3>
                <Plus
                  className="h-5 w-5 flex-shrink-0 text-brand-slate transition-transform duration-300 ease-smooth group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              <p className="px-6 pb-6 text-[1rem] leading-[1.8] text-brand-slate sm:px-7 sm:pb-7">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
