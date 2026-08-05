import { ImageResponse } from 'next/og'
import { locales, isLocale } from '@/lib/i18n'

/**
 * Link-preview card, generated at build time.
 *
 * Without this, sharing the site in WhatsApp, LinkedIn or Slack renders a blank
 * card — which, for a business whose main channel is WhatsApp, is the single
 * most expensive thing missing from the site.
 *
 * Deliberately Latin-only: ImageResponse ships Latin glyphs by default, and
 * loading a Hebrew webfont at build time is a fragile dependency for an asset
 * that is essentially a logo card.
 */

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'PROPEL — web development and business automation'

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

const TAGLINE: Record<string, string> = {
  he: 'Websites & business automation',
  en: 'Websites & business automation',
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const tagline = isLocale(lang) ? TAGLINE[lang] : TAGLINE.en

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#F4F5F7',
        padding: '80px',
      }}
    >
      {/* Mark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 16,
            backgroundColor: '#8E1B1B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: 44,
            fontWeight: 900,
          }}
        >
          P
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, color: '#14161A', letterSpacing: -1 }}>
          PROPEL
        </div>
      </div>

      {/* Headline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            fontSize: 82,
            fontWeight: 800,
            color: '#14161A',
            letterSpacing: -3,
            lineHeight: 1.05,
            maxWidth: 900,
          }}
        >
          We speed up what slows you down
        </div>
        <div style={{ fontSize: 34, color: '#5B6270' }}>{tagline}</div>
      </div>

      {/* Rule */}
      <div style={{ display: 'flex', height: 6, width: 160, backgroundColor: '#8E1B1B' }} />
    </div>,
    size,
  )
}
