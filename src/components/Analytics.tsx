'use client'

import { useEffect } from 'react'

/**
 * Conversion tracking.
 *
 * Every call to action in the site carries a `data-analytics` attribute naming
 * where it sits (`whatsapp:hero`, `whatsapp:service-webdev`, `contact:submit`).
 * This listener forwards those clicks to whichever analytics provider is on the
 * page, and does nothing when none is - so the instrumentation is already in
 * place the moment you add GA4, Vercel Analytics or anything else.
 *
 * Without this you can see that leads arrive but never which part of the page
 * produced them, which is the difference between a brochure and something you
 * can improve.
 */

type EventProps = Record<string, string>

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: EventProps) => void
    dataLayer?: unknown[]
    va?: (event: string, name: string, props?: EventProps) => void
  }
}

export function trackEvent(name: string, props: EventProps = {}): void {
  if (typeof window === 'undefined') return

  window.gtag?.('event', name, props)
  window.va?.('event', name, props)
  if (window.dataLayer && !window.gtag) {
    window.dataLayer.push({ event: name, ...props })
  }
}

export default function Analytics() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-analytics]')
      if (!target) return

      const value = target.dataset.analytics
      if (!value) return

      // "whatsapp:hero" → event "whatsapp", location "hero"
      const [name, location = 'unknown'] = value.split(':')
      trackEvent(name, { location })
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return null
}
