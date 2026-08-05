'use client'

import { useEffect, useRef, useState } from 'react'
import { A11Y_KEY } from '@/lib/clientPrefs'
import {
  Accessibility,
  X,
  Type,
  Contrast,
  Link2,
  AlignJustify,
  Pause,
  RotateCcw,
} from 'lucide-react'

/**
 * The accessibility menu.
 *
 * Every preference is a single attribute on <html>, matched by CSS in
 * globals.css. Nothing here re-renders the page, nothing is passed down as a
 * prop, and no component needs to know a preference exists. That also means a
 * preference reaches content that has not mounted yet - which matters for the
 * motion control, because the project cards it governs are far below the fold.
 *
 * Applied before first paint by the same inline script that restores the theme,
 * so a returning visitor never sees the default state flash first.
 *
 * What is deliberately not here: a "screen reader mode" (screen readers are
 * already running and a page that tries to help interferes), colour inversion
 * (it destroys the logo and the client screenshots), greyscale (it erases an
 * accent that carries meaning), and a large-cursor toggle (CSS cannot deliver
 * one, and the operating system already does it properly). Each looks
 * substantial in a feature list and helps nobody.
 */

export type A11yMenuDict = {
  title: string
  open: string
  close: string
  text_size: string
  contrast: string
  links: string
  spacing: string
  motion: string
  reset: string
  statement: string
}

type Props = {
  dict: A11yMenuDict
  statementHref: string
}

/** Root font size per step. 100% is the browser default and stores nothing. */
const TEXT_STEPS = [100, 115, 130, 150, 175, 200]

type Prefs = {
  text: number
  contrast: boolean
  links: boolean
  spacing: boolean
  motion: boolean
}

const DEFAULTS: Prefs = { text: 100, contrast: false, links: false, spacing: false, motion: false }

function apply(prefs: Prefs) {
  const root = document.documentElement

  // The root font size is the mechanism the whole type scale hangs off. It only
  // works because the scale is rem and the spacing scale is px - see
  // tailwind.config.ts.
  root.style.fontSize = prefs.text === 100 ? '' : `${prefs.text}%`

  const flag = (name: string, on: boolean) => {
    if (on) root.setAttribute(name, '')
    else root.removeAttribute(name)
  }

  flag('data-a11y-contrast', prefs.contrast)
  flag('data-a11y-links', prefs.links)
  flag('data-a11y-spacing', prefs.spacing)

  // Shared with MotionToggle in the nav, so the two controls agree.
  if (prefs.motion) root.dataset.motion = 'paused'
  else delete root.dataset.motion
}

export default function AccessibilityMenu({ dict, statementHref }: Props) {
  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(A11Y_KEY)
      if (stored) setPrefs({ ...DEFAULTS, ...JSON.parse(stored) })
      else if (document.documentElement.dataset.motion === 'paused')
        setPrefs((p) => ({ ...p, motion: true }))
    } catch {
      // Corrupt or unreadable storage falls back to defaults rather than throwing.
    }
  }, [])

  const update = (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch }
    setPrefs(next)
    apply(next)
    try {
      localStorage.setItem(A11Y_KEY, JSON.stringify(next))
    } catch {
      // Private browsing refuses writes. The preference holds for this page view.
    }
  }

  const reset = () => {
    setPrefs(DEFAULTS)
    apply(DEFAULTS)
    try {
      localStorage.removeItem(A11Y_KEY)
    } catch {
      // As above.
    }
  }

  /*
   * The panel is a dialog, and is held to what a dialog owes: Escape closes it,
   * focus moves in on open and returns to the trigger on close, and focus is
   * trapped while it is open.
   *
   * Written from scratch rather than copied from the mobile drawer. That
   * pattern failed all three - and an accessibility menu that is itself
   * inaccessible is worse than none, because it is the part of the site a
   * regulator reads first.
   */
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    const trigger = triggerRef.current
    if (!panel) return

    const focusable = () =>
      [...panel.querySelectorAll<HTMLElement>('button, a[href], input, select')].filter(
        (el) => !el.hasAttribute('disabled'),
      )

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        return
      }
      if (event.key !== 'Tab') return

      const items = focusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!panel.contains(event.target as Node) && event.target !== trigger) setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    focusable()[0]?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
      trigger?.focus()
    }
  }, [open])

  const textIndex = TEXT_STEPS.indexOf(prefs.text)

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={dict.open}
        aria-expanded={open}
        aria-controls="a11y-panel"
        className="flex h-12 w-12 items-center justify-center border border-brand-line bg-brand-panel text-brand-ink shadow-sm transition-colors duration-200 ease-smooth hover:border-brand-accent hover:text-brand-accent"
      >
        <Accessibility className="h-6 w-6" aria-hidden="true" />
      </button>

      {open && (
        <div
          id="a11y-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label={dict.title}
          /*
           * Anchored to the rail rather than to the viewport, so it opens
           * upward from the button on the side the rail sits on - which is the
           * right in English and the left in Hebrew, from one declaration.
           */
          className="absolute bottom-0 end-14 max-h-[70vh] w-[min(19rem,calc(100vw-5rem))] overflow-y-auto border border-brand-line bg-brand-panel p-5 shadow-lg"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-[0.9375rem] font-bold text-brand-ink">{dict.title}</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={dict.close}
              className="text-brand-slate transition-colors duration-200 hover:text-brand-accent"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* ── Text size ─────────────────────────────────────────────────── */}
          <div className="mb-4">
            <p
              id="a11y-text-label"
              className="mb-2 flex items-center gap-2 text-[0.8125rem] font-semibold text-brand-ink"
            >
              <Type className="h-4 w-4 text-brand-accent" aria-hidden="true" />
              {dict.text_size}
            </p>
            {/*
             * A radio group, not six toggles. The steps are mutually exclusive,
             * and `aria-pressed` on a mutually exclusive set tells a screen
             * reader there are six independent switches, five of them off.
             */}
            <div role="radiogroup" aria-labelledby="a11y-text-label" className="flex gap-1">
              {TEXT_STEPS.map((step, i) => (
                <button
                  key={step}
                  type="button"
                  role="radio"
                  aria-checked={textIndex === i}
                  onClick={() => update({ text: step })}
                  className={`flex-1 border py-1.5 text-[0.75rem] font-semibold transition-colors duration-200 ${
                    textIndex === i
                      ? 'border-brand-accent bg-brand-accent text-brand-onAccent'
                      : 'border-brand-line text-brand-slate hover:border-brand-accent hover:text-brand-accent'
                  }`}
                >
                  {step === 100 ? 'A' : `${step}%`}
                </button>
              ))}
            </div>
          </div>

          {/* ── Switches ──────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-1">
            <Switch
              icon={<Contrast className="h-4 w-4" aria-hidden="true" />}
              label={dict.contrast}
              on={prefs.contrast}
              onChange={() => update({ contrast: !prefs.contrast })}
            />
            <Switch
              icon={<Link2 className="h-4 w-4" aria-hidden="true" />}
              label={dict.links}
              on={prefs.links}
              onChange={() => update({ links: !prefs.links })}
            />
            <Switch
              icon={<AlignJustify className="h-4 w-4" aria-hidden="true" />}
              label={dict.spacing}
              on={prefs.spacing}
              onChange={() => update({ spacing: !prefs.spacing })}
            />
            <Switch
              icon={<Pause className="h-4 w-4" aria-hidden="true" />}
              label={dict.motion}
              on={prefs.motion}
              onChange={() => update({ motion: !prefs.motion })}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-brand-line pt-4">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-brand-slate transition-colors duration-200 hover:text-brand-accent"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              {dict.reset}
            </button>
            <a
              href={statementHref}
              className="text-[0.75rem] text-brand-slate underline underline-offset-2 transition-colors duration-200 hover:text-brand-accent"
            >
              {dict.statement}
            </a>
          </div>
        </div>
      )}
    </>
  )
}

/** A labelled on/off control. `aria-pressed` is correct here - these are
 *  independent switches, unlike the text-size steps. */
function Switch({
  icon,
  label,
  on,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  on: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={on}
      className={`flex items-center justify-between gap-3 border px-3 py-2 text-[0.8125rem] transition-colors duration-200 ${
        on
          ? 'border-brand-accent text-brand-accent'
          : 'border-transparent text-brand-slate hover:border-brand-line hover:text-brand-ink'
      }`}
    >
      <span className="flex items-center gap-2 text-start">
        <span className={on ? 'text-brand-accent' : 'text-brand-slate'}>{icon}</span>
        {label}
      </span>
      {/* Decorative: the state is already carried by aria-pressed. */}
      <span
        aria-hidden="true"
        className={`h-4 w-7 flex-shrink-0 border transition-colors duration-200 ${
          on ? 'border-brand-accent bg-brand-accent' : 'border-brand-line'
        }`}
      />
    </button>
  )
}
