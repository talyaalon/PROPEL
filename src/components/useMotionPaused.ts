'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { MOTION_KEY } from '@/lib/clientPrefs'

/**
 * Whether automatic motion is paused, read from the document itself.
 *
 * Two controls set this - the toggle in the nav and the switch in the
 * accessibility menu - and they were each keeping their own copy of the answer
 * in React state, in their own localStorage key. That produced a defect that
 * defeated the entire WCAG 2.2.2 Level A mechanism: pausing from the nav, then
 * changing any unrelated preference in the menu, silently restarted the
 * animation, because the menu wrote its whole preference object back and its
 * copy of `motion` had never learned it was true.
 *
 * There is one answer now and it lives on `<html>`. `useSyncExternalStore` over
 * a MutationObserver means both controls read the same attribute, and whoever
 * changes it, the other re-renders immediately. Nothing can go stale because
 * nothing holds a copy.
 */

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-motion'],
  })
  return () => observer.disconnect()
}

const read = () => document.documentElement.dataset.motion === 'paused'

// The server has no document. Motion is never paused in the initial HTML - the
// inline init script pauses it before paint, on the client.
const readServer = () => false

export function useMotionPaused(): [boolean, (paused: boolean) => void] {
  const paused = useSyncExternalStore(subscribe, read, readServer)

  const setPaused = useCallback((next: boolean) => {
    if (next) document.documentElement.dataset.motion = 'paused'
    else delete document.documentElement.dataset.motion

    try {
      if (next) localStorage.setItem(MOTION_KEY, 'paused')
      else localStorage.removeItem(MOTION_KEY)
    } catch {
      // Private browsing refuses writes. The preference holds for this page view.
    }
  }, [])

  return [paused, setPaused]
}
