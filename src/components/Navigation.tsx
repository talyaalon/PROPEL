'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X, MessageCircle, Phone } from 'lucide-react'
import { getWhatsAppURL } from '@/lib/whatsapp'
import { siteConfig } from '@/lib/config'
import Image from 'next/image'
import LocaleSwitch from '@/components/LocaleSwitch'
import Logo from '@/components/Logo'
import ThemeToggle from '@/components/ThemeToggle'
import MotionToggle from '@/components/MotionToggle'
import type { Locale } from '@/lib/i18n'

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
  toggle_motion: string
  switch_language: string
}

type NavLinkProps = {
  href: string
  className: string
  onNavigate?: () => void
  children: React.ReactNode
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

/*
 * `navLinks` mixes same-page anchors with real routes. Rendering all of them as
 * a plain <a> meant /blog re-downloaded, re-parsed and re-hydrated the whole
 * bundle on every visit - a white flash on a phone, and the mechanism behind
 * the sticky WhatsApp button losing its reference to #contact for the session.
 *
 * Declared at module scope, not inside Navigation. A component defined in a
 * render body is a new type on every render, so React was destroying and
 * rebuilding every nav link on each drawer open and each pathname change -
 * discarding prefetch observers, restarting transitions, and dropping focus on
 * a nav link to <body>.
 */
export function NavLink({ href, className, onNavigate, children }: NavLinkProps) {
  return href.includes('#') ? (
    <a href={href} onClick={onNavigate} className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} onClick={onNavigate} className={className}>
      {children}
    </Link>
  )
}

export default function Navigation({ lang, dict, hasProjects, a11y, logoSrc }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)

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
   * page of the site, and consumed as `` - both branches
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
  /*
   * Publishes the sticky band's real height as `--nav-h`, for scroll-padding.
   *
   * The band is `min-height` now rather than a fixed height, so it grows two
   * ways a stylesheet cannot predict: the row wraps when the content stops
   * fitting (126px at /en 768), and it scales with the accessibility menu's
   * text control (131px at 200%). A hardcoded `scroll-padding-top` was right
   * for exactly one of those and buried in-page anchor targets 50px under the
   * header in the other.
   *
   * A ResizeObserver is the only thing that knows. The CSS keeps its em value
   * as the fallback, so anchors still clear the band before this runs and if
   * JavaScript never does.
   */
  useEffect(() => {
    const band = headerRef.current
    if (!band || typeof ResizeObserver === 'undefined') return

    const publish = () =>
      document.documentElement.style.setProperty('--nav-h', `${band.offsetHeight}px`)

    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(band)
    return () => observer.disconnect()
  }, [])

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
    const header = headerRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    /*
     * Everything outside the drawer goes inert. Without it, tabbing out of the
     * open drawer landed on a link below the fold that the scroll lock made
     * unreachable - the user could neither see it nor scroll to it. `inert`
     * removes those nodes from the tab order and the accessibility tree at
     * once, which is both the focus trap and the screen-reader fix.
     *
     * By exclusion, not by list. This used to name `#main` and `footer`
     * explicitly, and two commits later the floating accessibility rail was
     * added as a third body child - so focus escaped straight back out of the
     * drawer into it, and the trigger there opened a second dialog on top of
     * this one. Excluding the header instead means a sibling added tomorrow is
     * covered without anyone remembering to add it.
     */
    const outside = [...document.body.children].filter(
      (node) => node !== headerRef.current && !node.hasAttribute('inert'),
    )
    outside.forEach((node) => node.setAttribute('inert', ''))
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize, { passive: true })

    drawerRef.current?.querySelector<HTMLElement>('a')?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      outside.forEach((node) => node.removeAttribute('inert'))
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
      // Without this the closing drawer unmounts the focused node and focus
      // falls to <body>, restarting the keyboard user at the top of the page.
      // The trigger is display:none above 768px, and focusing a hidden element
      // silently no-ops - so the resize-close case (the drawer closes because
      // the viewport widened past the breakpoint) falls back to the first
      // link in the header, which is the logo.
      ;(trigger?.offsetParent ? trigger : header?.querySelector('a'))?.focus()
    }
  }, [isOpen])

  return (
    <header ref={headerRef} className="sticky top-0 z-50 transition-all duration-500 ease-smooth">
      {/* ── Main nav bar ────────────────────────────────────────── */}
      <nav
        className="header-band relative flex min-h-[68px] items-center border-b border-brand-line backdrop-blur-xl sm:min-h-[76px]"
        aria-label={a11y.primary_nav}
      >
        <div
          className="bg-grain pointer-events-none absolute inset-0 select-none opacity-[0.028]"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6 lg:px-8">
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
              <Logo className="text-[1.625rem] sm:text-[1.75rem]" />
            )}
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-9 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                onNavigate={() => setIsOpen(false)}
                href={link.href}
                className="group relative text-[0.875rem] font-medium tracking-wide text-brand-slate transition-colors duration-300 hover:text-brand-ink"
              >
                {link.label}
                {/* Logical `start-0` and `origin-*` keyed off the locale: the
                    underline used to grow left-to-right in Hebrew too, so it
                    ran away from the word instead of under it. */}
                <span
                  className={`absolute -bottom-0.5 start-0 h-px w-full scale-x-0 bg-brand-ink transition-transform duration-300 ease-smooth group-hover:scale-x-100 ${
                    isRtl ? 'underline-rtl' : 'underline-ltr'
                  }`}
                />
              </NavLink>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-5 md:flex">
            <MotionToggle label={a11y.toggle_motion} />
            <ThemeToggle label={a11y.toggle_theme} />
            <LocaleSwitch
              lang={lang}
              label={dict.toggle_lang}
              switchLabel={a11y.switch_language}
              className="text-[0.875rem] font-medium tracking-wide text-brand-slate transition-colors duration-300 hover:text-brand-ink"
            />
            {/*
              The phone number, in the header.

              Measured on production: fifteen of the seventeen calls to action
              on the homepage were the same wa.me link, and the *first* phone
              number appeared at 83% scroll depth. A visitor who does not use
              WhatsApp - a B2B buyer, anyone on a desktop without WhatsApp Web -
              had one route to this business and it was eleven screens down.

              `dir="ltr"` because a phone number is a Latin-digit sequence and
              would otherwise reorder in the Hebrew header.
            */}
            {siteConfig.phoneDisplay && (
              <a
                href={`tel:${siteConfig.phoneDial}`}
                dir="ltr"
                data-analytics="phone:nav"
                className="hidden items-center gap-2 text-[0.875rem] font-semibold tracking-wide text-brand-ink transition-colors duration-300 hover:text-brand-accent lg:flex"
              >
                <Phone className="h-4 w-4 text-brand-accent" aria-hidden="true" />
                {siteConfig.phoneDisplay}
              </a>
            )}
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
          role="dialog"
          /*
           * No `aria-modal`. The header is deliberately not inert - the
           * close button is the hamburger and lives outside this element -
           * so claiming modality would tell a screen-reader user that the
           * one control that closes the drawer does not exist. The rest of
           * the page is inert, which is what actually constrains focus.
           */
          aria-label={a11y.primary_nav}
          className="animate-slide-down header-band border-b border-brand-line px-4 pb-6 pt-3 text-start sm:px-6 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                onNavigate={() => setIsOpen(false)}
                href={link.href}
                className="px-4 py-3 text-[1rem] font-medium text-brand-ink transition-colors duration-200 hover:bg-brand-line"
              >
                {link.label}
              </NavLink>
            ))}

            <div className="mt-3 space-y-2 border-t border-brand-line pt-4">
              {/* The only theme control used to live in the `md:flex` row, so
                  below 768px dark mode was unreachable - and nothing falls back
                  to `prefers-color-scheme`, so a phone in dark mode got the
                  light site with no way out. */}
              <div className="flex gap-2 px-4 py-1">
                <MotionToggle label={a11y.toggle_motion} />
                <ThemeToggle label={a11y.toggle_theme} />
              </div>
              <LocaleSwitch
                lang={lang}
                label={dict.toggle_lang}
                switchLabel={a11y.switch_language}
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-4 py-2.5 text-sm font-medium text-brand-slate transition-colors duration-200 hover:text-brand-ink"
              />
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
