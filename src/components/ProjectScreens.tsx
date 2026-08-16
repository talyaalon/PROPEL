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

  // On touch there is no hover, so the scroll is driven by visibility instead.
  const [playing, setPlaying] = useState(false)

  /*
   * One observer drives both, and `playing` follows the viewport instead of
   * latching.
   *
   * It used to be two effects: the first disconnected on the first
   * intersection, and the second set `playing` true with no path back to
   * false. On touch - where `is-playing` is the only driver, because there is
   * no hover - that meant the 17s scroll ran exactly once per page load and
   * then froze at `center bottom`. A visitor who scrolled to the contact form
   * and back up found three dead crops of the clients' page footers.
   *
   * `visible` still latches, deliberately: it gates a multi-megabyte
   * background image, and unloading one because the card left the viewport
   * would only make it reload.
   */
  useEffect(() => {
    const element = ref.current
    if (!element) return

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    /*
     * `(hover: none)` alone was too narrow a gate.
     *
     * It is true on a phone and false everywhere else, which sounds right -
     * hover drives the desktop. But a desktop window dragged down to phone
     * width still reports `hover: hover`, so at that size nothing auto-played
     * and nothing was hovering either: the frames just sat there. Same for a
     * touchscreen laptop, which reports both.
     *
     * `(pointer: coarse)` is the more accurate question - is the primary input
     * a finger - and the width check covers the resized-window case, where
     * there is no room for hover to be discoverable anyway.
     */
    const mayAnimate =
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      (window.matchMedia('(pointer: coarse)').matches ||
        window.matchMedia('(hover: none)').matches ||
        window.matchMedia('(max-width: 767px)').matches)

    /*
     * Two observers, because they need different roots. `intersectionRatio` is
     * measured against the *expanded* root, so a single observer carrying the
     * 600px prefetch margin would report the card as on screen while it is
     * still 600px below the fold - which is how the transition used to be ~6%
     * through before the visitor ever saw it.
     */
    const loader = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setVisible(true)
        loader.disconnect()
      },
      // Start fetching a screen ahead of the scroll so the frame is rarely
      // caught empty, without loading all five up front.
      // 1200px, not 600. At 375 a 600px margin is under one screen ahead, so the
      // request often started after the card was already visible - and an
      // unloaded frame is a bordered white rectangle in the proof section.
      { rootMargin: '1200px 0px' },
    )

    const player = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting))

    loader.observe(element)
    if (mayAnimate) player.observe(element)
    return () => {
      loader.disconnect()
      player.disconnect()
    }
  }, [])

  const shot = (src?: string) =>
    visible && src ? ({ ['--shot']: `url(${src})` } as React.CSSProperties) : undefined

  const state = playing ? ' is-playing' : ''

  return (
    <div ref={ref} className="screens" role="img" aria-label={title}>
      {/*
        The phone is a device wrapping the glass, not a bordered rectangle with
        a picture in it - so the capture scrolls *inside* it. The body and the
        island are decorative and carry no DOM cost beyond this one wrapper;
        `aria-hidden` is on the frame, so the whole assembly is announced once
        by the `role="img"` above and never as parts.
      */}
      <div className="phone" aria-hidden="true">
        <span className="phone__island" />
        <div className={`screen screen--phone${state}`} style={shot(mobile)} />
      </div>

      <div className="browser" aria-hidden="true">
        <div className="browser__bar">
          <span className="browser__dot" />
          <span className="browser__dot" />
          <span className="browser__dot" />
        </div>
        <div className={`screen screen--desktop${state}`} style={shot(desktop)} />
      </div>
    </div>
  )
}
