import type { ReactNode } from 'react'
import Script from 'next/script'
import type { Metadata, Viewport } from 'next'
import { Assistant, Chakra_Petch, Frank_Ruhl_Libre, Heebo } from 'next/font/google'
import { notFound } from 'next/navigation'
import { locales, getDirection, isLocale } from '@/lib/i18n'
import { getDictionary } from '@/lib/getDictionary'
import { professionalServiceSchema, webSiteSchema } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import { siteConfig, assertProductionConfig } from '@/lib/config'
import { getProjects } from '@/content/projects'
import { getLogoSrc } from '@/lib/brandAssets'
import Navigation from '@/components/Navigation'
import Footer from '@/components/sections/Footer'
import Analytics from '@/components/Analytics'
import FloatingRail from '@/components/FloatingRail'
import { prefsInitScript } from '@/lib/clientPrefs'
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
  // 400 removed: measured `status: unloaded` on production in both locales
  // after a full scroll. Headings use 600 and 700; nothing uses 400, and a
  // `rel=preload` fetched its 9.8KB on every page anyway.
  weight: ['600', '700'],
  variable: '--font-chakra',
  display: 'swap',
})

/*
 * Hebrew subset only, and only the two weights headings actually use. Latin in
 * the display face is Chakra Petch's job, and body text is Assistant's - which
 * carries Hebrew of its own. Four weights across two subsets was 92.7KB in the
 * build that no visitor ever downloaded, because of the fallback ordering
 * described in tailwind.config.ts.
 */
const heebo = Heebo({
  subsets: ['hebrew'],
  // Same measurement, same result - 12.0KB of Hebrew 400 that never
  // rendered a glyph. Headings fall through to 700.
  weight: ['700'],
  variable: '--font-heebo',
  display: 'swap',
})

// Tagline only — the serif in the printed lockup. Not preloaded: it renders a
// single line, well below the critical path.
const frankRuhl = Frank_Ruhl_Libre({
  subsets: ['hebrew', 'latin'],
  /*
   * 400 for the tagline, 700 for headings.
   *
   * Chakra Petch carries no Hebrew, so on the default locale every heading
   * fell through to Heebo 700 - the most common face in Israeli web design,
   * paired with Assistant, which is the most common pairing. The site's entire
   * typographic identity existed only on /en.
   *
   * Frank Ruhl Libre was already here, already subset for Hebrew, and earning
   * its bytes with 23 glyphs at 10.4px in the footer. A bold Hebrew serif at
   * 66px against Chakra Petch's Latin numerals is the printed logo's own
   * pairing, and almost nobody in this market uses it.
   */
  weight: ['400', '700'],
  variable: '--font-frank',
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

/*
 * The colour under the browser chrome.
 *
 * These two hexes were `brand.mist` and `brand.char` from the palette before
 * last, and neither exists in globals.css any more. The page paints `#F6F5F1`
 * in both cases, so a phone in dark mode showed a near-black address bar
 * directly above a cream page.
 *
 * Keyed to nothing, because the theme here is not keyed to the system
 * preference - it is `data-theme` on <html>, set by ThemeToggle from
 * localStorage, and there is no `prefers-color-scheme` block in the stylesheet.
 * Declaring `light dark` while only ever painting light is the mismatch that
 * produced the seam. `--header` is the value actually under the chrome.
 */
export const viewport: Viewport = {
  themeColor: '#E9E7E1',
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
    /*
     * Search Console ownership, from the environment. Set
     * NEXT_PUBLIC_GSC_VERIFICATION to the `content` value of the HTML-tag
     * method (the token alone, not the whole tag) and redeploy - the meta tag
     * renders on every page, so verification works whichever URL Google
     * lands on after the locale redirect. Unset, nothing renders. The token
     * is not a secret: it is printed in the page source by design.
     */
    verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
      : undefined,
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
      /* No data-theme attribute means light. ThemeToggle writes data-theme="dark",
         and prefsInitScript below restores the stored choice before first paint -
         every surface, text and accent colour flips through CSS variables. */
      className={`${chakraPetch.variable} ${heebo.variable} ${assistant.variable} ${frankRuhl.variable}`}
    >
      {/*
        No literal <head> element.

        There was one, holding all three of the tags below, and the App Router
        silently dropped its contents - the inline script was in the React tree
        and simply never reached the served HTML. Confirmed by grepping the
        response: zero occurrences of `localStorage`. So the theme had in fact
        never been restored before first paint, and a returning dark-mode
        visitor got a flash of the light page on every single navigation.

        React 19 hoists `<link>` and `<script>` from anywhere in the tree into
        <head> on its own, so declaring them here as ordinary children is both
        correct and what actually ships.
      */}
      <body>
        {/*
          The paper texture is the LCP element on every page - it fills the
          header band, so it is the largest thing painted above the fold. It was
          being discovered by the CSS parser rather than the preload scanner,
          which put it 362ms behind two logo preloads that are not the LCP: on
          throttled 4G it started at 567ms and finished at 1,925ms, for a
          measured LCP of 2.84s at 1440. Declaring it moves the request to the
          front of the queue.
        */}
        {/* Default priority, not high: paper.webp is a decorative texture,
            and at fetchPriority="high" it competed for first-window bandwidth
            with the fonts and CSS that the (text) LCP actually needs. Still
            preloaded, so the background does not pop in late. */}
        <link rel="preload" as="image" href="/paper.webp" />

        {/* Applies the stored theme and accessibility preferences before the
            browser paints. A client component cannot run this early. */}
        <script dangerouslySetInnerHTML={{ __html: prefsInitScript }} />

        {/* Scroll-reveal sections start hidden. If the bundle never runs, this
            guarantees the page is still fully readable. */}
        <noscript>
          <style>{`.reveal { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:bg-brand-accent focus:px-6 focus:py-3 focus:font-display focus:text-sm focus:font-bold focus:uppercase focus:tracking-[.08em] focus:text-brand-surface"
        >
          {dict.a11y.skip_to_content}
        </a>

        {/*
          Before the header in the DOM, though it paints in the bottom corner -
          it is `position: fixed`, so the two are independent. This is what puts
          the pause control ahead of the motion it governs in the tab order;
          last in <body> made it tab stop 49 of 49 while the animated cards
          began at stop 10.
        */}
        <FloatingRail
          a11yDict={dict.a11y_menu}
          statementHref={`/${lang}/accessibility`}
          whatsappMessage={dict.footer.whatsapp_message}
          whatsappLabel={dict.footer.whatsapp_cta}
        />

        <ScrollProgress />
        <Navigation
          lang={lang}
          dict={dict.nav}
          hasProjects={hasProjects}
          a11y={dict.a11y}
          logoSrc={getLogoSrc(lang)}
        />
        {/* tabIndex={-1}: the skip link sets location.hash, but without a
            tabindex the <main> is not focusable, so activeElement stayed on
            <body> and the next Tab restarted from the top - the skip link
            skipped nothing in Safari and only worked elsewhere by relying on
            the sequential-focus starting point. Same pattern as the form's
            success and error regions. */}
        {/* Site-wide structured data. The organization is one business, so it
            is one node with one @id, present on every page that references it
            - which is all of them. The WebSite node declares the locale. */}
        <JsonLd schema={professionalServiceSchema(lang, dict.meta.description)} />
        <JsonLd schema={webSiteSchema(lang, dict.meta.title, dict.meta.description)} />

        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer
          lang={lang}
          dict={dict.footer}
          switchLabel={dict.a11y.switch_language}
          hasProjects={hasProjects}
        />

        {/* GA4, only when the property exists. The click instrumentation
            (Analytics.tsx forwarding every data-analytics click to gtag) has
            been in place for weeks; this is the missing loader. Without the
            env var nothing renders and nothing is requested. */}
        {process.env.NEXT_PUBLIC_GA4_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${process.env.NEXT_PUBLIC_GA4_ID}');`}
            </Script>
          </>
        )}
        <Analytics />
      </body>
    </html>
  )
}
