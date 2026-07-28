import Link from 'next/link'
import { MessageCircle, Phone, Mail } from 'lucide-react'
import { getWhatsAppURL } from '@/lib/whatsapp'
import { siteConfig } from '@/lib/config'
import type { Locale } from '@/lib/i18n'
import LocaleSwitch from '@/components/LocaleSwitch'
import Logo from '@/components/Logo'

type FooterDict = {
  tagline: string
  links_title: string
  contact_title: string
  nav_services: string
  nav_process: string
  nav_portfolio: string
  nav_about: string
  nav_faq: string
  nav_contact: string
  whatsapp_cta: string
  phone_label: string
  email_label: string
  legal_title: string
  accessibility: string
  privacy: string
  copyright: string
  whatsapp_message: string
}

type Props = {
  lang: Locale
  dict: FooterDict
  hasProjects: boolean
}

export default function Footer({ lang, dict, hasProjects }: Props) {
  const altLangLabel = lang === 'he' ? 'EN' : 'HE'

  const navLinks = [
    { label: dict.nav_services, href: `/${lang}#services` },
    { label: dict.nav_process, href: `/${lang}#process` },
    ...(hasProjects ? [{ label: dict.nav_portfolio, href: `/${lang}#portfolio` }] : []),
    { label: dict.nav_about, href: `/${lang}#about` },
    { label: dict.nav_faq, href: `/${lang}#faq` },
    { label: dict.nav_contact, href: `/${lang}#contact` },
  ]

  return (
    <footer className="bg-brand-deep px-4 py-16 text-brand-ink sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4 lg:gap-12">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo tone="dark" className="text-[26px]" />
            <p className="mt-4 max-w-[260px] text-[13px] leading-relaxed text-brand-muted">
              {dict.tagline}
            </p>
            {(siteConfig.legalName || siteConfig.businessId) && (
              <p className="mt-4 text-[12px] leading-relaxed text-brand-muted">
                {siteConfig.legalName}
                {siteConfig.legalName && siteConfig.businessId ? ' · ' : ''}
                {siteConfig.businessId}
              </p>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h2 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-muted">
              {dict.links_title}
            </h2>
            <ul className="space-y-3.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[13px] font-medium text-brand-muted transition-colors duration-300 hover:text-brand-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h2 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-muted">
              {dict.legal_title}
            </h2>
            <ul className="space-y-3.5">
              <li>
                <Link
                  href={`/${lang}/accessibility`}
                  className="text-[13px] font-medium text-brand-muted transition-colors duration-300 hover:text-brand-ink"
                >
                  {dict.accessibility}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/privacy`}
                  className="text-[13px] font-medium text-brand-muted transition-colors duration-300 hover:text-brand-ink"
                >
                  {dict.privacy}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-muted">
              {dict.contact_title}
            </h2>

            <a
              href={getWhatsAppURL(dict.whatsapp_message)}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics="whatsapp:footer"
              className="flex items-center gap-4 border border-brand-ink/10 bg-brand-ink/5 p-5 transition-all duration-500 ease-smooth hover:border-brand-ink/20 hover:bg-brand-ink/10 hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-green-500/10">
                <MessageCircle className="h-5 w-5 text-green-400" />
              </div>
              <span className="text-[13px] font-medium text-brand-ink">{dict.whatsapp_cta}</span>
            </a>

            {/* Direct contact details — B2B buyers look for these to confirm you are a real business */}
            {(siteConfig.phoneDisplay || siteConfig.email) && (
              <ul className="mt-5 space-y-3">
                {siteConfig.phoneDisplay && (
                  <li>
                    <a
                      href={`tel:${siteConfig.phoneDisplay.replace(/[^\d+]/g, '')}`}
                      className="flex items-center gap-3 text-[13px] text-brand-muted transition-colors duration-300 hover:text-brand-ink"
                    >
                      <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                      <span className="sr-only">{dict.phone_label}: </span>
                      <span dir="ltr">{siteConfig.phoneDisplay}</span>
                    </a>
                  </li>
                )}
                {siteConfig.email && (
                  <li>
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="flex items-center gap-3 text-[13px] text-brand-muted transition-colors duration-300 hover:text-brand-ink"
                    >
                      <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                      <span className="sr-only">{dict.email_label}: </span>
                      <span dir="ltr">{siteConfig.email}</span>
                    </a>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────────────── */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-brand-ink/10 pt-6 sm:flex-row sm:items-center lg:mt-16 lg:pt-8">
          <p className="text-[12px] text-brand-muted">{dict.copyright}</p>
          <LocaleSwitch
            lang={lang}
            label={altLangLabel}
            className="text-[11px] font-semibold tracking-[0.15em] text-brand-muted transition-colors duration-300 hover:text-brand-ink"
          />
        </div>
      </div>
    </footer>
  )
}
