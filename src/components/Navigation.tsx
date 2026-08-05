'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, MessageCircle } from 'lucide-react'
import { getWhatsAppURL } from '@/lib/whatsapp'
import Image from 'next/image'
import Logo from '@/components/Logo'
import ThemeToggle from '@/components/ThemeToggle'
import { getAltLocale, swapLocaleInPath, type Locale } from '@/lib/i18n'

type NavDict = {
  services: string
  blog: string
  process: string
  portfolio: string
  about: string
  cta: string
  toggle_lang: string
  whatsapp_message: string
}

type A11yDict = {
  open_menu: string
  close_menu: string
  primary_nav: string
  home: string
  toggle_theme: string
}

type Props = {
  lang: Locale
  dict: NavDict
  a11y: A11yDict
  /** Resolved on the server; null when no artwork has been added. */
  logoSrc: string | null
  /** The portfolio anchor is omitted when nothing is published, so the link never dangles. */
  hasProjects: boolean
}

export default function Navigation({ lang, dict, hasProjects, a11y, logoSrc }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const drawerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const altLang = getAltLocale(lang)
  const altHref = swapLocaleInPath(pathname, altLang)
  const isRtl = lang === 'he'

  const navLinks = [
    { label: dict.services, href: `/${lang}#services` },
    { label: dict.process, href: `/${lang}#process` },
    ...(hasProjects ? [{ label: dict.portfolio, href: `/${lang}#portfolio` }] : []),
    { label: dict.about, href: `/${lang}#about` },
    { label: dict.blog, href: `/${lang}/blog` },
  ]

  /*
   * There was a `scrolled` state here, updated by a scroll listener on every
   * page of the site, and consumed as `` — both branches
   * empty. A listener and a re-render for nothing.
   */

  /*
   * Drawer side effects: Escape to close, background scroll lock, focus moved
   * in on open and returned to the trigger on close.
   *
   * The resize guard is not cosmetic. The drawer and its close button are both
   * `md:hidden`; opening the drawer on a phone and then rotating to landscape
   * used to leave `isOpen` true with no way to reach the toggle, so this
   * cleanup never ran and `body { overflow: hidden }` persisted — the page
   * stayed unscrollable until a reload.
   */
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false)
    }

    // Captured now rather than read in the cleanup: the toggle is the same node
    // for the life of the component, and reading `.current` later trips the
    // exhaustive-deps rule for a hazard that does not apply here.
    const trigger = triggerRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize, { passive: true })

    drawerRef.current?.querySelector<HTMLElement>('a')?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
      // Without this the closing drawer unmounts the focused node and focus
      // falls to <body>, restarting the keyboard user at the top of the page.
      trigger?.focus()
    }
  }, [isOpen])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ease-smooth `}>
      {/* ── Main nav bar ────────────────────────────────────────── */}
      <nav
        className="header-band relative h-[68px] overflow-hidden border-b border-brand-line backdrop-blur-xl sm:h-[76px]"
        aria-label={a11y.primary_nav}
      >
        <div
          className="bg-grain pointer-events-none absolute inset-0 select-none opacity-[0.028]"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href={`/${lang}`} className="flex-shrink-0" aria-label={a11y.home}>
            {logoSrc ? (
              <span className="logo-plate inline-flex">
                <Image
                  src={logoSrc}
                  alt="PROPEL"
                  width={1200}
                  height={377}
                  priority
                  sizes="(min-width: 640px) 130px, 115px"
                  className="h-9 w-auto sm:h-10"
                />
              </span>
            ) : (
              <Logo className="text-[26px] sm:text-[28px]" />
            )}
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-9 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group relative text-[13px] font-medium tracking-wide text-brand-slate transition-colors duration-300 hover:text-brand-ink"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-brand-ink transition-transform duration-300 ease-smooth group-hover:scale-x-100" />
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-5 md:flex">
            <ThemeToggle label={a11y.toggle_theme} />
            <Link
              href={altHref}
              hrefLang={altLang}
              className="text-[13px] font-medium tracking-wide text-brand-slate transition-colors duration-300 hover:text-brand-ink"
            >
              {dict.toggle_lang}
            </Link>
            <a
              href={getWhatsAppURL(dict.whatsapp_message)}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics="whatsapp:nav"
              className="flex items-center gap-2 rounded-full btn"
            >
              <MessageCircle className="h-4 w-4" />
              {dict.cta}
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            ref={triggerRef}
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-xl p-2 text-brand-ink transition-colors duration-200 hover:bg-brand-line md:hidden"
            aria-label={isOpen ? a11y.close_menu : a11y.open_menu}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ───────────────────────────────────────── */}
      {isOpen && (
        <div
          id="mobile-menu"
          ref={drawerRef}
          className={`animate-slide-down header-band border-b border-brand-line px-4 pb-6 pt-3 sm:px-6 md:hidden ${
            isRtl ? 'text-right' : 'text-left'
          }`}
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-3 text-[15px] font-medium text-brand-ink transition-colors duration-200 hover:bg-brand-line"
              >
                {link.label}
              </a>
            ))}

            <div className="mt-3 space-y-2 border-t border-brand-line pt-4">
              <Link
                href={altHref}
                hrefLang={altLang}
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-4 py-2.5 text-sm font-medium text-brand-slate transition-colors duration-200 hover:text-brand-ink"
              >
                {dict.toggle_lang}
              </Link>
              <a
                href={getWhatsAppURL(dict.whatsapp_message)}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics="whatsapp:nav-mobile"
                className="flex items-center justify-center gap-2.5 rounded-full btn"
              >
                <MessageCircle className="h-4 w-4" />
                {dict.cta}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
