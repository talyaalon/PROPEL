'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, MessageCircle } from 'lucide-react'
import { getWhatsAppURL } from '@/lib/whatsapp'
import { getAltLocale, swapLocaleInPath, type Locale } from '@/lib/i18n'

type NavDict = {
  services: string
  process: string
  portfolio: string
  about: string
  cta: string
  toggle_lang: string
  whatsapp_message: string
}

type Props = {
  lang: Locale
  dict: NavDict
  /** The portfolio anchor is omitted when nothing is published, so the link never dangles. */
  hasProjects: boolean
}

export default function Navigation({ lang, dict, hasProjects }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const drawerRef = useRef<HTMLDivElement>(null)

  const altLang = getAltLocale(lang)
  const altHref = swapLocaleInPath(pathname, altLang)
  const isRtl = lang === 'he'

  const navLinks = [
    { label: dict.services, href: `/${lang}#services` },
    { label: dict.process, href: `/${lang}#process` },
    ...(hasProjects ? [{ label: dict.portfolio, href: `/${lang}#portfolio` }] : []),
    { label: dict.about, href: `/${lang}#about` },
  ]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close the drawer on Escape and lock background scroll while it is open.
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    // Move focus into the drawer so keyboard users are not left behind the trigger
    drawerRef.current?.querySelector<HTMLElement>('a')?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
        scrolled ? 'shadow-nav' : ''
      }`}
    >
      {/* ── Main nav bar ────────────────────────────────────────── */}
      <nav
        className="relative h-[68px] overflow-hidden border-b border-brand-border bg-brand-cream/95 backdrop-blur-xl sm:h-[76px]"
        aria-label="Primary navigation"
      >
        <div
          className="bg-grain pointer-events-none absolute inset-0 select-none opacity-[0.028]"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href={`/${lang}`} className="flex-shrink-0" aria-label="PROPEL — home">
            <Image
              src={lang === 'he' ? '/he-logo.svg' : '/en-logo.svg'}
              alt="PROPEL"
              width={130}
              height={38}
              priority
              className="h-9 w-auto object-contain sm:h-10"
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-9 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group relative text-[13px] font-medium tracking-wide text-brand-steel transition-colors duration-300 hover:text-brand-charcoal"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-brand-charcoal transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-x-100" />
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-5 md:flex">
            <Link
              href={altHref}
              hrefLang={altLang}
              className="text-[13px] font-medium tracking-wide text-brand-steel transition-colors duration-300 hover:text-brand-charcoal"
            >
              {dict.toggle_lang}
            </Link>
            <a
              href={getWhatsAppURL(dict.whatsapp_message)}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics="whatsapp:nav"
              className="flex items-center gap-2 rounded-full bg-brand-black px-6 py-3 text-sm font-semibold tracking-wide text-white transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(17,17,17,0.28)] active:translate-y-0 active:scale-[0.97] active:shadow-none"
            >
              <MessageCircle className="h-4 w-4" />
              {dict.cta}
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-xl p-2 text-brand-charcoal transition-colors duration-200 hover:bg-brand-border/40 md:hidden"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
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
          className={`animate-slide-down border-b border-brand-border bg-brand-cream px-4 pb-6 pt-3 shadow-card sm:px-6 md:hidden ${
            isRtl ? 'text-right' : 'text-left'
          }`}
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-3 text-[15px] font-medium text-brand-charcoal transition-colors duration-200 hover:bg-brand-border/40"
              >
                {link.label}
              </a>
            ))}

            <div className="mt-3 space-y-2 border-t border-brand-border pt-4">
              <Link
                href={altHref}
                hrefLang={altLang}
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-4 py-2.5 text-sm font-medium text-brand-steel transition-colors duration-200 hover:text-brand-charcoal"
              >
                {dict.toggle_lang}
              </Link>
              <a
                href={getWhatsAppURL(dict.whatsapp_message)}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics="whatsapp:nav-mobile"
                className="flex items-center justify-center gap-2.5 rounded-full bg-brand-black px-5 py-4 text-sm font-semibold tracking-wide text-white transition-all duration-300 active:scale-[0.97]"
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
