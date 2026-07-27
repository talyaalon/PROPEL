import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { Assistant, DM_Sans, Raleway } from 'next/font/google'
import { notFound } from 'next/navigation'
import { locales, getDirection, isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { siteConfig, assertProductionConfig } from '@/lib/config'
import { getProjects } from '@/content/projects'
import Navigation from '@/components/Navigation'
import Footer from '@/components/sections/Footer'
import Analytics from '@/components/Analytics'
import StickyWhatsApp from '@/components/StickyWhatsApp'
import '../globals.css'

// Fails a production deploy that still carries placeholder contact details.
assertProductionConfig()

// ── Fonts ─────────────────────────────────────────────────────────────────────
//
// All three are declared without a `weight`, which makes next/font fetch the
// *variable* build of each family: one file covering every weight the design
// uses (400–800) instead of a separate static file per weight. That also means
// `font-extrabold` on the H1 renders as a real 800 rather than a browser-faked
// bold, which is what the previous 300–700 weight list produced.
//
// The body carries the active locale's font *className*, not just its CSS
// variable. That distinction matters: binding font-family through a stylesheet
// rule (`html[lang='he'] body { … }`, as this project did before) hides the
// dependency from Next, which then emits no font preload at all and makes the
// browser wait for the CSS to parse before it even discovers the font. Applying
// the className gives Next the static signal it needs.

const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  variable: '--font-assistant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

// Display face only — used for large numerals and the 404 mark, never for body
// copy, so it has no business competing on the critical path.
const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
  display: 'swap',
  preload: false,
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
  themeColor: '#F9F7F2',
  colorScheme: 'light',
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
      className={`${assistant.variable} ${dmSans.variable} ${raleway.variable}`}
    >
      <head>
        {/* Scroll-reveal sections start hidden. If the bundle never runs, this
            guarantees the page is still fully readable. */}
        <noscript>
          <style>{`.reveal { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
      </head>
      <body className={lang === 'he' ? assistant.className : dmSans.className}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-black focus:px-6 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        >
          {dict.a11y.skip_to_content}
        </a>

        <Navigation lang={lang} dict={dict.nav} hasProjects={hasProjects} />
        <main id="main">{children}</main>
        <Footer lang={lang} dict={dict.footer} hasProjects={hasProjects} />

        <StickyWhatsApp
          message={dict.footer.whatsapp_message}
          label={dict.footer.whatsapp_cta}
        />
        <Analytics />
      </body>
    </html>
  )
}
