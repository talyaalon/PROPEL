'use client'

import { useEffect, useState } from 'react'

/**
 * Reading-progress bar pinned to the top of the viewport.
 *
 * Scales a single element on the X axis rather than animating `width`, so the
 * whole thing stays on the compositor and never triggers layout during scroll.
 * It is decorative — `aria-hidden`, no role — because the same information is
 * already available to assistive tech through the scrollbar itself.
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      setProgress(scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]" aria-hidden="true">
      <div
        className="h-full w-full origin-left ltr:origin-left rtl:origin-right"
        style={{
          transform: `scaleX(${progress})`,
          // Single-hue, matching the brand accent. The token lives in
          // tailwind.config.ts; these are the resolved values.
          background: 'linear-gradient(90deg, #C8FF3D, #A6E01F)',
        }}
      />
    </div>
  )
}
