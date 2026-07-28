import { Plus } from 'lucide-react'

type FaqItem = {
  question: string
  answer: string
}

type FaqDict = {
  section_title: string
  section_subtitle: string
  items: FaqItem[]
}

/**
 * Built on native <details>/<summary>: keyboard accessible, screen-reader
 * friendly and searchable by the browser's find-in-page, with no JavaScript.
 * The same content feeds the FAQPage structured data on the homepage.
 */
export default function Faq({ dict }: { dict: FaqDict }) {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="section">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center lg:mb-16">
          <h2
            id="faq-heading"
            className="text-3xl font-bold tracking-[-0.025em] text-brand-ink sm:text-4xl lg:text-[44px] lg:leading-[1.15]"
          >
            {dict.section_title}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-[1.75] text-brand-muted sm:text-[17px]">
            {dict.section_subtitle}
          </p>
        </div>

        <div className="divide-y divide-brand-ink/15 overflow-hidden border border-brand-ink/15 bg-brand-deep">
          {dict.items.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 p-6 text-start transition-colors duration-200 hover:bg-brand-void/60 sm:p-7 [&::-webkit-details-marker]:hidden">
                <h3 className="text-[16px] font-bold tracking-[-0.01em] text-brand-ink sm:text-[17px]">
                  {item.question}
                </h3>
                <Plus
                  className="h-5 w-5 flex-shrink-0 text-brand-muted transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              <p className="px-6 pb-6 text-[15px] leading-[1.8] text-brand-muted sm:px-7 sm:pb-7">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
