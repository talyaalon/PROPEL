'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { A11Y_KEY } from '@/lib/clientPrefs'
import { useMotionPaused } from './useMotionPaused'
import FilterChips from './FilterChips'
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

/*
 * `motion` is deliberately absent.
 *
 * It used to live here as well as in MotionToggle, each with its own copy and
 * its own storage key, and the result defeated the Level A mechanism the
 * control exists to provide: pausing from the nav and then changing any
 * unrelated preference here restarted the animation, because `apply()` wrote
 * this object's stale `motion: false` back to the document. It is read from
 * and written to the document now, through `useMotionPaused`.
 */
type Prefs = {
  text: number
  contrast: boolean
  links: boolean
  spacing: boolean
}

const DEFAULTS: Prefs = { text: 100, contrast: false, links: false, spacing: false }

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
}

export default function AccessibilityMenu({ dict, statementHref }: Props) {
  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS)
  const [paused, setPaused] = useMotionPaused()
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(A11Y_KEY)
      if (stored) setPrefs({ ...DEFAULTS, ...JSON.parse(stored) })
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
    // Motion is stored under its own key, so clearing this one left the page
    // unpaused but the preference intact - it came back on the next load.
    setPaused(false)
    try {
      localStorage.removeItem(A11Y_KEY)
    } catch {
      // As above.
    }
  }

  /*
   * A disclosure, not a modal dialog - and it now says so.
   *
   * It previously trapped Tab at both ends while declaring `aria-modal=
   * "false"`, which is a direct contradiction: a screen-reader user is told the
   * rest of the page is reachable and then cannot Tab to it. A small settings
   * popover in the corner has no business making the page inert, so the honest
   * resolution is the other one - the trap is gone, Tab leaves naturally, and
   * Escape and click-outside still close it.
   *
   * Written from scratch rather than copied from the mobile drawer, whose
   * pattern failed Escape, focus-in and focus-return alike. An accessibility
   * menu that is itself inaccessible is worse than none, because it is the part
   * of the site a regulator opens first.
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
      // Focus first, close second. Returning focus from the cleanup cannot
      // work - by then the panel is unmounted and activeElement is <body>.
      if (event.key === 'Escape') {
        trigger?.focus()
        setOpen(false)
      }
    }

    const onPointerDown = (event: MouseEvent) => {
      /*
       * `contains`, not identity. The trigger holds a centred 24px icon inside
       * a 48px button, so a click aimed at the icon - which is what a button
       * with a centred glyph invites - has the <svg> as its target, not the
       * <button>. The identity check passed, this handler closed the panel, and
       * the button's own onClick then re-opened it: the menu could only be
       * closed by hitting the ~12px frame around the icon.
       */
      const target = event.target as Node
      if (!panel.contains(target) && !trigger?.contains(target)) setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    focusable()[0]?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
      /*
       * Deliberately does nothing here. Escape and the close button both move
       * focus themselves, before unmounting. The remaining close path is the
       * click-outside handler, and there the visitor has already put focus
       * somewhere of their own choosing - dragging it back to the corner
       * trigger is what used to make a nav-link click start the next page with
       * focus in the bottom corner.
       */
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        // The label has to follow the state, or it announces "Open the
        // accessibility menu, button, expanded" - which describes the
        // opposite of what pressing it will do.
        aria-label={open ? dict.close : dict.open}
        aria-expanded={open}
        // Only while the panel exists - `aria-controls` pointing at nothing is
        // worse than absent, and `aria-expanded` already carries the state.
        aria-controls={open ? 'a11y-panel' : undefined}
        className="flex h-12 w-12 items-center justify-center border border-brand-line bg-brand-panel text-brand-ink shadow-sm transition-colors duration-200 ease-smooth hover:border-brand-accent hover:text-brand-accent"
      >
        <Accessibility className="h-6 w-6" aria-hidden="true" />
      </button>

      {open && (
        <div
          id="a11y-panel"
          ref={panelRef}
          role="group"
          aria-label={dict.title}
          /*
           * Anchored to the rail rather than to the viewport, so it opens
           * upward from the button on the side the rail sits on - which is the
           * right in English and the left in Hebrew, from one declaration.
           */
          /*
           * px on both terms. `calc(100vw - 5rem)` doubled to `100vw - 160px`
           * at 200% text and left a 160px panel on a 320px phone - three of the
           * six size steps were pushed outside it, so a visitor who stepped up
           * to 150% could no longer reach 200%. Every other spacing value moved
           * to px in the type refactor; this arbitrary one was missed.
           */
          className="absolute bottom-0 end-14 max-h-[70vh] w-[min(304px,calc(100vw-80px))] overflow-y-auto border border-brand-line bg-brand-panel p-5 shadow-lg"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-[1rem] font-bold text-brand-ink">{dict.title}</h2>
            <button
              type="button"
              onClick={() => {
                triggerRef.current?.focus()
                setOpen(false)
              }}
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
              className="mb-2 flex items-center gap-2 text-[0.875rem] font-semibold text-brand-ink"
            >
              <Type className="h-4 w-4 text-brand-accent" aria-hidden="true" />
              {dict.text_size}
            </p>
            {/*
              The same component the portfolio and blog filters use. This was a
              hand-rolled set of six `role="radio"` buttons with no tabIndex and
              no key handler: the role promises arrow-key operation and Tab-out,
              and it delivered neither, while taking six tab stops in a
              thirteen-stop panel. The working implementation was sixty lines
              away and had been written for exactly this.
            */}
            <FilterChips
              label={dict.text_size}
              status={`${prefs.text}%`}
              active={String(prefs.text)}
              onChange={(value) => update({ text: Number(value) })}
              options={TEXT_STEPS.map((step) => ({
                value: String(step),
                // Announced as its value, not as a letter. "A, radio button, 1 of 6"
                // says nothing about what selecting it does.
                label: `${step}%`,
              }))}
              // Three across, two rows, below the width where six 44px targets fit.
              className="grid grid-cols-3 gap-1 sm:grid-cols-6"
            />
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
              on={paused}
              onChange={() => setPaused(!paused)}
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
            <Link
              href={statementHref}
              // Closes without returning focus, unlike the X - the visitor is
              // navigating away, and pulling focus back to the corner trigger
              // would start the next page in the bottom corner.
              onClick={() => setOpen(false)}
              className="text-[0.75rem] text-brand-slate underline underline-offset-2 transition-colors duration-200 hover:text-brand-accent"
            >
              {dict.statement}
            </Link>
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
      className={`flex items-center justify-between gap-3 border px-3 py-2 text-[0.875rem] transition-colors duration-200 ${
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
