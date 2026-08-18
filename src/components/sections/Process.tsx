type ProcessStep = {
  title: string
  duration: string
  description: string
}

type ProcessDict = {
  eyebrow: string
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
    <section
      id="process"
      aria-labelledby="process-heading"
      className="section section--invert draft-marks"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col items-center text-center lg:mb-20">
          <p className="eyebrow mb-6">
            <span className="clause" aria-hidden="true">
              02
            </span>
            {dict.eyebrow}
          </p>
          <h2 id="process-heading" className="text-brand-ink lg:text-[3.25rem] lg:leading-[1.1]">
            {dict.section_title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-[1.75] text-brand-slate sm:text-[1.1875rem]">
            {dict.section_subtitle}
          </p>
        </div>

        <ol className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {dict.steps.map((step, index) => (
            <li key={step.title} className="card flex flex-col">
              {/* Step number */}
              {/* Full accent at 4.5rem. It was 42px at 30% opacity - the
                  biggest type on the page outside the headings, and the only
                  display gesture in the design, turned down until it read as a
                  watermark. */}
              <span className="num text-[4.5rem] leading-[0.85]" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>

              <h3 className="mt-5 text-[1.1875rem] font-bold text-brand-ink">{step.title}</h3>

              <p className="mt-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-brand-slate">
                {step.duration}
              </p>

              <p className="mt-4 text-[0.875rem] leading-relaxed text-brand-slate">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
