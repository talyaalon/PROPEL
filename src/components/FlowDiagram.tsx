import type { Locale } from '@/lib/i18n'
import type { Bilingual } from '@/content/projects'

/**
 * The client's real process, drawn as a numbered spine.
 *
 * This is blueprint element 6 (docs/design-language.md) and the reason the
 * whole direction works: the diagram's raw material is the flow we actually
 * built for this client, taken from the approved case-study narrative - not
 * a template graphic. A competitor can copy the styling in an afternoon; they
 * cannot copy J-Cafe's order path.
 *
 * Semantics before drawing: the <ol> IS the content - a screen reader gets
 * "list, N items" in the right order, which is exactly what a process is.
 * The spine and the numbered squares are CSS on top (`.flow` in globals.css).
 * Vertical on purpose: a downward sequence needs no arrowheads and no RTL
 * mirroring, and it reads identically in both locales.
 */

export type FlowStep = {
  label: Bilingual
  /** One line of concrete detail under the step name. Optional. */
  meta?: Bilingual
}

type Props = {
  steps: FlowStep[]
  lang: Locale
  /** Names the figure for assistive tech; rendered as the block's heading by the caller. */
  ariaLabel: string
}

export default function FlowDiagram({ steps, lang, ariaLabel }: Props) {
  if (steps.length === 0) return null

  return (
    <ol className="flow" aria-label={ariaLabel}>
      {steps.map((step, index) => (
        <li key={step.label[lang]} className="flow__node">
          {/* The number is decoration - the <ol> already carries order. */}
          <span className="flow__index" aria-hidden="true">
            {index + 1}
          </span>
          <span>
            <span className="flow__label">{step.label[lang]}</span>
            {step.meta && <span className="flow__meta">{step.meta[lang]}</span>}
          </span>
        </li>
      ))}
    </ol>
  )
}
