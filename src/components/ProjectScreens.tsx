'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A monitor and a phone showing the same site, scrolling inside their frames.
 *
 * The effect is pure CSS: each frame's background is a full-page screenshot,
 * and moving `background-position` from top to bottom over 17s reads as the
 * page scrolling. The rules live in globals.css under `.screen`.
 *
 * Three things this component adds that the CSS alone cannot:
 *
 *  - **Deferred images.** These screenshots are ~5000px tall. Five projects on
 *    one page is several megabytes, and `background-image` gets none of the
 *    native lazy-loading that <img loading="lazy"> does. `--shot` is therefore
 *    left unset until the frames are near the viewport.
 *  - **Touch.** There is no hover on a phone, so the same observer adds
 *    `is-playing`, which drives the identical transition.
 *  - **Reduced motion.** Checked here as well as in CSS, so the preference wins
 *    before this component has mounted.
 */

type Props = {
  desktop?: string
  mobile?: string
  /** Used only for the accessible description; the frames themselves are decorative. */
  title: string
}

export default function ProjectScreens({ desktop, mobile, title }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setVisible(true)
        observer.disconnect()
      },
      // Start fetching a screen ahead of the scroll so the frame is rarely
      // caught empty, without loading all five up front.
      { rootMargin: '600px 0px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // On touch there is no hover, so the scroll is driven by visibility instead.
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!visible) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(hover: none)').matches) return
    setPlaying(true)
  }, [visible])

  const shot = (src?: string) =>
    visible && src ? ({ ['--shot']: `url(${src})` } as React.CSSProperties) : undefined

  const state = playing ? ' is-playing' : ''

  return (
    <div ref={ref} className="screens" role="img" aria-label={title}>
      <div className={`screen screen--phone${state}`} style={shot(mobile)} aria-hidden="true" />
      <div className={`screen screen--desktop${state}`} style={shot(desktop)} aria-hidden="true" />
    </div>
  )
}
