import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { getWhatsAppURL } from '@/lib/whatsapp'

type FooterDict = {
  tagline: string
  links_title: string
  contact_title: string
  nav_services: string
  nav_portfolio: string
  nav_about: string
  whatsapp_cta: string
  copyright: string
  whatsapp_message: string
}

type Props = {
  lang: 'he' | 'en'
  dict: FooterDict
}

export default function Footer({ lang, dict }: Props) {
  const altLang = lang === 'he' ? 'en' : 'he'
  const altLangLabel = lang === 'he' ? 'EN' : 'HE'

  const navLinks = [
    { label: dict.nav_services, href: '#services' },
    { label: dict.nav_portfolio, href: '#portfolio' },
    { label: dict.nav_about, href: '#about' },
  ]

  return (
    <footer className="bg-brand-black px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">

        {/* ── Three-column grid ───────────────────────────────── */}
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-3 lg:gap-16">

          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="font-raleway text-2xl font-black tracking-tight text-white">
              PROPEL
            </div>
            <p className="mt-4 max-w-[260px] text-[13px] leading-relaxed text-white/45">
              {dict.tagline}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/30">
              {dict.links_title}
            </h4>
            <ul className="space-y-3.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[13px] font-medium text-white/50 transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / WhatsApp */}
          <div>
            <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/30">
              {dict.contact_title}
            </h4>
            <a
              href={getWhatsAppURL(dict.whatsapp_message)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-[20px] border border-white/8 bg-white/5 p-5 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:border-white/[0.12] hover:bg-white/[0.08] hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-green-500/10">
                <MessageCircle className="h-5 w-5 text-green-400" />
              </div>
              <span className="text-[13px] font-medium text-white">
                {dict.whatsapp_cta}
              </span>
            </a>
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────────────── */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/8 pt-6 sm:flex-row sm:items-center lg:mt-16 lg:pt-8">
          <p className="text-[12px] text-white/30">{dict.copyright}</p>
          <Link
            href={`/${altLang}`}
            className="text-[11px] font-semibold tracking-[0.15em] text-white/30 transition-colors duration-300 hover:text-white"
          >
            {altLangLabel}
          </Link>
        </div>
      </div>
    </footer>
  )
}
