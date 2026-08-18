import Link from 'next/link'
import { NavLink } from '@/components/Navigation'
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
  nav_blog: string
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
  /** "Switch to English" / "מעבר לעברית" - the a11y dictionary's phrase,
      threaded through so the footer switcher carries the same accessible
      name as the header's. It had none at all. */
  switchLabel: string
  hasProjects: boolean
}

export default function Footer({ lang, dict, hasProjects, switchLabel }: Props) {
  const altLangLabel = lang === 'he' ? 'EN' : 'HE'

  const navLinks = [
    { label: dict.nav_services, href: `/${lang}#services` },
    { label: dict.nav_process, href: `/${lang}#process` },
    ...(hasProjects ? [{ label: dict.nav_portfolio, href: `/${lang}#portfolio` }] : []),
    { label: dict.nav_about, href: `/${lang}#about` },
    { label: dict.nav_blog, href: `/${lang}/blog` },
    { label: dict.nav_faq, href: `/${lang}#faq` },
    { label: dict.nav_contact, href: `/${lang}#contact` },
  ]

  return (
    <footer className="section--invert px-4 py-16 text-brand-ink sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4 lg:gap-12">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo tagline={dict.tagline} className="text-[1.625rem]" />
            {(siteConfig.legalName || siteConfig.businessId) && (
              <p className="mt-4 text-[0.75rem] leading-relaxed text-brand-slate">
                {siteConfig.legalName}
                {siteConfig.legalName && siteConfig.businessId ? ' · ' : ''}
                {siteConfig.businessId}
              </p>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h2 className="mb-5 text-[0.75rem] font-semibold uppercase tracking-[0.22em] text-brand-slate">
              {dict.links_title}
            </h2>
            <ul className="space-y-3.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <NavLink
                    href={link.href}
                    className="text-[0.875rem] font-medium text-brand-slate transition-colors duration-300 hover:text-brand-ink"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h2 className="mb-5 text-[0.75rem] font-semibold uppercase tracking-[0.22em] text-brand-slate">
              {dict.legal_title}
            </h2>
            <ul className="space-y-3.5">
              <li>
                <Link
                  href={`/${lang}/accessibility`}
                  className="text-[0.875rem] font-medium text-brand-slate transition-colors duration-300 hover:text-brand-ink"
                >
                  {dict.accessibility}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/privacy`}
                  className="text-[0.875rem] font-medium text-brand-slate transition-colors duration-300 hover:text-brand-ink"
                >
                  {dict.privacy}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="mb-5 text-[0.75rem] font-semibold uppercase tracking-[0.22em] text-brand-slate">
              {dict.contact_title}
            </h2>

            <a
              href={getWhatsAppURL(dict.whatsapp_message)}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics="whatsapp:footer"
              className="flex items-center gap-4 border border-brand-line bg-brand-panel p-5 transition-all duration-500 ease-smooth hover:border-brand-line hover:bg-brand-line hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-successSoft">
                <MessageCircle className="h-5 w-5 text-brand-success" />
              </div>
              <span className="text-[0.875rem] font-medium text-brand-ink">
                {dict.whatsapp_cta}
              </span>
            </a>

            {/* Direct contact details - B2B buyers look for these to confirm you are a real business */}
            {(siteConfig.phoneDisplay || siteConfig.email) && (
              <ul className="mt-5 space-y-3">
                {siteConfig.phoneDisplay && (
                  <li>
                    <a
                      href={`tel:${siteConfig.phoneDial}`}
                      className="flex items-center gap-3 text-[0.875rem] text-brand-slate transition-colors duration-300 hover:text-brand-ink"
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
                      className="flex items-center gap-3 text-[0.875rem] text-brand-slate transition-colors duration-300 hover:text-brand-ink"
                    >
                      <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                      <span className="sr-only">{dict.email_label}: </span>
                      <span dir="ltr">
                        <span className="break-all">{siteConfig.email}</span>
                      </span>
                    </a>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────────────── */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-brand-line pt-6 sm:flex-row sm:items-center lg:mt-16 lg:pt-8">
          <p className="text-[0.75rem] text-brand-slate">{dict.copyright}</p>
          <LocaleSwitch
            lang={lang}
            label={altLangLabel}
            switchLabel={switchLabel}
            className="text-[0.75rem] font-semibold tracking-[0.15em] text-brand-slate transition-colors duration-300 hover:text-brand-ink"
          />
        </div>
      </div>
    </footer>
  )
}
