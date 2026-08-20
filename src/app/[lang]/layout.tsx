import type { ReactNode } from 'react'
import Script from 'next/script'
import type { Metadata, Viewport } from 'next'
import { Assistant } from 'next/font/google'
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
/*
 * One typeface: Assistant, for everything.
 *
 * It replaced a deliberate four-family system, and the reasoning that system
 * was built on is worth keeping because it was correct: Chakra Petch carries
 * no Hebrew glyphs, so Latin and digits rendered in its technical letterforms
 * while Hebrew fell through per character to Heebo - and later to Frank Ruhl
 * Libre for headings - with no locale branching anywhere in the markup. The
 * font-stack ORDER was load-bearing: the raw family name had to come first,
 * because next/font's metric fallback is a local Arial that does carry Hebrew
 * and would otherwise satisfy every Hebrew character before the cascade
 * reached the Hebrew face.
 *
 * All of that is gone now, on the owner's instruction, and the trade is a good
 * one: four families across nine woff2 files were 95-126KB per page, the
 * largest asset class on the site. Assistant is a single variable font
 * carrying both scripts, and it was already in the build.
 *
 * Hierarchy is now carried by weight, size and letter-spacing alone - which is
 * what `font-display`'s uppercase tracking and the heading weights were always
 * doing anyway, next to the family change.
 */
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
      className={assistant.variable}
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
        {/*
          `fetchPriority="high"`, and the reasoning that removed it was wrong.
          I demoted this on the grounds that a decorative texture should not
          outbid the fonts - but the LCP element on this site IS
          `section.header-band`, whose background is this file. An external
          audit measured 1,060ms of "resource load delay" out of a 1.7s LCP,
          and Lighthouse names the fix explicitly: fetchpriority=high on the
          preload. It is 14,676 bytes; it is not competing with anything.
        */}
        <link rel="preload" as="image" href="/paper.webp" fetchPriority="high" />

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
