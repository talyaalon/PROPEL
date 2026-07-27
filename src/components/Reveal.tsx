'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Fades a section up as it scrolls into view.
 *
 * Three things make this safe rather than decorative:
 *
 *  - The hidden state comes from the server-rendered class, so there is no
 *    flash of content appearing and then being hidden by JavaScript.
 *  - A `<noscript>` rule in the layout forces `.reveal` visible, so a failed or
 *    blocked bundle can never leave the page blank.
 *  - Reduced-motion is checked here *and* in CSS, so the preference wins even
 *    before this component mounts.
 *
 * The observer disconnects after the first intersection — revealing once is the
 * point; re-animating on every scroll past is the thing that gets irritating.
 */

type Props = {
  children: ReactNode
  /** Stagger within a group, in milliseconds. */
  delay?: number
  className?: string
}

export default function Reveal({ children, delay = 0, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      element.classList.add('is-visible')
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        element.classList.add('is-visible')
        observer.disconnect()
      },
      // Trigger slightly before the element is fully in view so the motion has
      // finished by the time the reader's eye arrives.
      { threshold: 0.05, rootMargin: '0px 0px -8% 0px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
