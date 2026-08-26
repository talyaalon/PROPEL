'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

import { THEME_KEY } from '@/lib/clientPrefs'

/**
 * Light/dark switch.
 *
 * The chosen theme is written to <html data-theme> and remembered in
 * localStorage. First paint is handled by `themeInitScript` below rather than
 * by this component - a client component cannot run before hydration, so a
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
      className="inline-flex h-10 w-10 items-center justify-center border border-brand-line text-brand-slate transition-colors duration-200 ease-smooth hover:border-brand-accent hover:text-brand-accent"
    >
      {mounted && theme === 'dark' ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  )
}
