'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export const THEME_KEY = 'propel-theme'

/**
 * Light/dark switch.
 *
 * The chosen theme is written to <html data-theme> and remembered in
 * localStorage. First paint is handled by `themeInitScript` below rather than
 * by this component — a client component cannot run before hydration, so a
 * returning dark-mode visitor would otherwise get a flash of the light page.
 */
export default function ThemeToggle({ label }: { label: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
    setTheme(current)
    setMounted(true)
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      // Private browsing can refuse writes. The toggle still works for this
      // page view; it just will not be remembered.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      // Until mounted, the icon would render from the default state and could
      // contradict the theme the inline script already applied.
      aria-pressed={mounted ? theme === 'dark' : undefined}
      className="inline-flex h-9 w-9 items-center justify-center border border-brand-line text-brand-slate transition-colors duration-200 ease-smooth hover:border-brand-accent hover:text-brand-accent"
    >
      {mounted && theme === 'dark' ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  )
}

/**
 * Runs before first paint, so the correct theme is on <html> by the time the
 * browser draws anything. Kept deliberately tiny and dependency-free; it is
 * inlined into <head>, not bundled.
 */
export const themeInitScript = `
(function(){try{
  if (localStorage.getItem('${THEME_KEY}') === 'dark') {
    document.documentElement.dataset.theme = 'dark';
  }
  if (localStorage.getItem('propel-motion') === 'paused') {
    document.documentElement.dataset.motion = 'paused';
  }
}catch(e){}})();
`.trim()
