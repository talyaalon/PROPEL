type ProcessStep = {
  title: string
  duration: string
  description: string
}

type ProcessDict = {
  section_title: string
  section_subtitle: string
  steps: ProcessStep[]
}

/**
 * Answers the single biggest B2B objection: "what actually happens after I
 * get in touch?" Naming a duration on each step is what makes it credible.
 */
export default function Process({ dict }: { dict: ProcessDict }) {
  return (
    <section id="process" aria-labelledby="process-heading" className="section section--band">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center lg:mb-20">
          <h2 id="process-heading" className="text-brand-ink lg:text-[52px] lg:leading-[1.1]">
            {dict.section_title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-[1.75] text-brand-slate sm:text-[17px]">
            {dict.section_subtitle}
          </p>
        </div>

        <ol className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {dict.steps.map((step, index) => (
            <li key={step.title} className="card flex flex-col">
              {/* Step number */}
              <span className="num text-[42px] leading-none opacity-30" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>

              <h3 className="mt-5 text-[17px] font-bold text-brand-ink">{step.title}</h3>

              <p className="mt-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-slate">
                {step.duration}
              </p>

              <p className="mt-4 text-[14px] leading-relaxed text-brand-slate">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
