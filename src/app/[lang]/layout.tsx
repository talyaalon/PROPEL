import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { Assistant, Chakra_Petch, Heebo } from 'next/font/google'
import { notFound } from 'next/navigation'
import { locales, getDirection, isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { siteConfig, assertProductionConfig } from '@/lib/config'
import { getProjects } from '@/content/projects'
import Navigation from '@/components/Navigation'
import Footer from '@/components/sections/Footer'
import Analytics from '@/components/Analytics'
import StickyWhatsApp from '@/components/StickyWhatsApp'
import ScrollProgress from '@/components/ScrollProgress'
import '../globals.css'

// Fails a production deploy that still carries placeholder contact details.
assertProductionConfig()

// ── Fonts ─────────────────────────────────────────────────────────────────────
//
// Two roles, three families:
//
// display Chakra Petch → Heebo headings, buttons, tags, numerals
// body Assistant → Heebo running text
//
// Chakra Petch carries no Hebrew glyphs, which is what makes the split work
// rather than something to work around: Latin and digits render in Chakra
// Petch's technical letterforms while Hebrew falls through to Heebo
// automatically, per character, with no locale branching in the markup.
//
// Chakra Petch and Heebo are requested at fixed weights because neither ships a
// variable build on Google Fonts; Assistant is left variable.

const chakraPetch = Chakra_Petch({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-chakra',
  display: 'swap',
})

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-heebo',
  display: 'swap',
})

const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  variable: '--font-assistant',
  display: 'swap',
})

// ── Route config ──────────────────────────────────────────────────────────────
// This is the app's only root layout: it renders <html>/<body> directly rather
// than reading the locale from a request header. Reading headers() would opt the
// entire site into per-request rendering; this way every page is static.

export const dynamicParams = false

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────

// `lang` is typed as a plain string because Next's generated route validator
// widens dynamic params; `isLocale` narrows it back to `Locale` at the top of
// each function.
type Props = {
  children: ReactNode
  params: Promise<{ lang: string }>
}

export const viewport: Viewport = {
  themeColor: '#090316',
  colorScheme: 'dark',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = await getDictionary(lang)

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: dict.meta.title,
      template: `%s | PROPEL`,
    },
    description: dict.meta.description,
    applicationName: 'PROPEL',
    openGraph: {
      type: 'website',
      siteName: 'PROPEL',
      title: dict.meta.title,
      description: dict.meta.description,
      url: `${siteConfig.url}/${lang}`,
      locale: lang === 'he' ? 'he_IL' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.meta.title,
      description: dict.meta.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  }
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default async function RootLayout({ children, params }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const hasProjects = getProjects().length > 0

  return (
    <html
      lang={lang}
      dir={getDirection(lang)}
      /* No data-theme attribute means dark. Set data-theme="light" here to
 serve the original cream palette instead — every surface, text and
 hairline colour flips through CSS variables in globals.css. */
      className={`${chakraPetch.variable} ${heebo.variable} ${assistant.variable}`}
    >
      <head>
        {/* Scroll-reveal sections start hidden. If the bundle never runs, this
 guarantees the page is still fully readable. */}
        <noscript>
          <style>{`.reveal { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:bg-brand-accent focus:px-6 focus:py-3 focus:font-display focus:text-sm focus:font-bold focus:uppercase focus:tracking-[.08em] focus:text-brand-deep"
        >
          {dict.a11y.skip_to_content}
        </a>

        <ScrollProgress />
        <Navigation lang={lang} dict={dict.nav} hasProjects={hasProjects} />
        <main id="main">{children}</main>
        <Footer lang={lang} dict={dict.footer} hasProjects={hasProjects} />

        <StickyWhatsApp message={dict.footer.whatsapp_message} label={dict.footer.whatsapp_cta} />
        <Analytics />
      </body>
    </html>
  )
}
