'use client'

import { useEffect, useState } from 'react'
import { Pause, Play } from 'lucide-react'

import { useMotionPaused } from './useMotionPaused'

/**
 * Stops the automatic motion on the page.
 *
 * WCAG 2.2.2 Pause, Stop, Hide is a **Level A** criterion: any movement that
 * starts on its own, runs for more than five seconds, and is presented
 * alongside other content needs a mechanism to pause, stop or hide it. The
 * project cards each run a 17-second background scroll, and on touch - where
 * there is no hover - they start on their own as soon as the card is in view.
 *
 * `prefers-reduced-motion` does not satisfy this. It is a system preference,
 * not a control on the page, and most visitors have never set one. It stays,
 * as a separate and complementary defence.
 *
 * Pause rather than hide: hiding would remove the portfolio's main visual.
 *
 * One control, not one per card. The criterion asks for "a mechanism", and six
 * near-identically-named buttons interleaved with the card links would make the
 * page harder to operate, not easier. The flag therefore lives on <html>, above
 * every card, so it also governs cards that have not mounted yet - which is why
 * this is a document attribute rather than React state. The matching rules are
 * in globals.css under `:root[data-motion='paused']`.
 */
export default function MotionToggle({ label }: { label: string }) {
  const [paused, setPaused] = useMotionPaused()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <button
      type="button"
      onClick={() => setPaused(!paused)}
      aria-label={label}
      // Until mounted the icon would render from the default state and could
      // contradict what the inline script has already applied.
      aria-pressed={mounted ? paused : undefined}
      className="inline-flex h-9 w-9 items-center justify-center border border-brand-line text-brand-slate transition-colors duration-200 ease-smooth hover:border-brand-accent hover:text-brand-accent"
    >
      {mounted && paused ? (
        <Play className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Pause className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  )
}
