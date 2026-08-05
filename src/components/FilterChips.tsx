'use client'

import { useId, useRef } from 'react'

/**
 * A single-select filter, shared by the portfolio and the blog.
 *
 * It existed twice, and both copies carried the same three defects - so a fix
 * to one left the other. They had also drifted apart visually: different font,
 * size, weight, case and hover colour, plus a `rounded-full` in one of them
 * that collapses to 0px under this project's border-radius scale and had been
 * doing nothing for some time.
 *
 * The three defects:
 *
 *  - `role="group"` with no accessible name. A group without a name is not
 *    exposed as a group at all, so a screen-reader user met four unlabelled
 *    buttons with nothing to say they were a filter set.
 *  - `aria-pressed` on a mutually exclusive set, which announces four
 *    independent toggles, three of them off. Selecting one deselects the
 *    others; that is a radio group, and it is one now.
 *  - No announcement when the results changed. Activating a filter took the
 *    grid from six cards to two in silence.
 *
 * Radio-group keyboard semantics come with the role: one tab stop for the whole
 * set, arrow keys to move between options. That is implemented here with a
 * roving tabindex, because the browser only does it for free with real
 * `<input type="radio">` elements.
 */

export type ChipOption<T extends string> = {
  value: T
  label: string
}

type Props<T extends string> = {
  options: ChipOption<T>[]
  active: T
  onChange: (value: T) => void
  /** Names the group. Required - an unnamed group is the defect this fixes. */
  label: string
  /** Announced when the selection changes, e.g. "3 projects shown". */
  status: string
}

export default function FilterChips<T extends string>({
  options,
  active,
  onChange,
  label,
  status,
}: Props<T>) {
  const groupId = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const move = (from: number, delta: number) => {
    const to = (from + delta + options.length) % options.length
    onChange(options[to].value)
    refs.current[to]?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    // Arrow semantics are mirrored by the browser in RTL for real radios; for a
    // roving tabindex they have to be mirrored here, so Left always means
    // "towards the start of the reading order".
    const rtl = document.documentElement.dir === 'rtl'
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight'
    const back = rtl ? 'ArrowRight' : 'ArrowLeft'

    if (event.key === forward || event.key === 'ArrowDown') {
      event.preventDefault()
      move(index, 1)
    } else if (event.key === back || event.key === 'ArrowUp') {
      event.preventDefault()
      move(index, -1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      move(0, 0)
    } else if (event.key === 'End') {
      event.preventDefault()
      move(options.length - 1, 0)
    }
  }

  return (
    <>
      <div
        role="radiogroup"
        aria-label={label}
        id={groupId}
        className="mb-10 flex flex-wrap justify-center gap-2"
      >
        {options.map((option, i) => {
          const isActive = option.value === active
          return (
            <button
              key={option.value}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="button"
              role="radio"
              aria-checked={isActive}
              // Roving tabindex: the set is one tab stop, and arrows move within it.
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => onKeyDown(event, i)}
              className={`border px-4 py-2 font-display text-[0.75rem] font-semibold uppercase tracking-[.06em] transition-all duration-200 ease-smooth ${
                isActive
                  ? 'border-brand-accent bg-brand-accent text-brand-onAccent'
                  : 'border-brand-line bg-brand-panel text-brand-slate hover:border-brand-accent hover:text-brand-accent'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {/* The result count, announced but not shown - the grid already shows it
          visually, and a screen-reader user is the one who cannot see that. */}
      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>
    </>
  )
}
