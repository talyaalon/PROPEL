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
export default function Process({ dict, clause }: { dict: ProcessDict; clause?: string }) {
  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="section section--invert draft-marks"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col items-center text-center lg:mb-20">
          <p className="eyebrow mb-6">
            {clause && (
              <span className="clause" aria-hidden="true">
                {clause}
              </span>
            )}
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
              {/* The step index wears the flow diagram's node treatment, not
                  a bare display numeral. Two numbering systems shared one
                  voice: clause numbers at 14px and these at 72px were both
                  bare accent figures, and the louder one was the less
                  important one. As a bordered node square, a step index reads
                  as what it is - a position in a process - and the clause
                  numbers keep sole ownership of the bare-numeral style.
                  `--flow-node-fill`: these sit on `--panel` cards, not the
                  case studies' `--surface`. */}
              <span className="flow__index [--flow-node-fill:var(--panel)]" aria-hidden="true">
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
