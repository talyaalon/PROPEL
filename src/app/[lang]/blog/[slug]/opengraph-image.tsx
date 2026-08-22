import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { locales, isLocale } from '@/lib/i18n'
import { mdxPosts } from '@/content/generated/posts'

/**
 * The per-article link-preview card - README-PUBLISHING section 7.
 *
 * The site-wide card identifies the brand; an article shared into a WhatsApp
 * group has one job, and it is the headline. Every card carries the article's
 * ogTitle in the language it will be read in, over the real brand palette -
 * paper, ink, slate, the dark red - not the approximated hexes the generic
 * card still uses.
 *
 * Hebrew works here because the font ships in the repo: Assistant 400/700 as
 * TTF under src/assets/fonts, read synchronously at build time. The site-wide
 * card stayed Latin-only precisely because fetching a Hebrew webfont at build
 * was a fragile network dependency - committing the file is what removes the
 * fragility, not avoiding the language. `node:fs` is fine in this file and
 * would not be in most of src/: these routes are statically generated, so
 * this code runs at build on Node, never on the edge. The middleware knows to
 * let /{lang}/blog/{slug}/opengraph-image through - nested metadata leaves
 * under a known parent path.
 *
 * THE BIDI PROBLEM, solved by hand because satori does not solve it. Satori
 * paints codepoints in memory order, left to right, regardless of
 * `direction` - the first Hebrew card rendered every word letter-reversed
 * (verified by screenshot: "מהבלוג" painted as "גולבהמ"). So Hebrew text here
 * goes through toVisualRTL(): lines are split manually (satori's own
 * wrapping would put the reversed lines in the wrong vertical order), and
 * each line is reordered into visual form - runs reversed, Hebrew runs
 * letter-reversed, Latin/digit runs kept intact, mirrored brackets swapped.
 * The three real titles are pure Hebrew; the Latin handling exists because
 * a future title containing "WordPress" would otherwise break silently.
 * Verified by screenshotting the generated PNGs, not by trusting this
 * comment.
 */

/** Mirror-image pairs, swapped when a line is reversed. */
const MIRROR: Record<string, string> = {
  '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<',
}

const isRtlChar = (ch: string) => /[֐-׿]/.test(ch)
const isLtrChar = (ch: string) => /[A-Za-z0-9]/.test(ch)

/**
 * One LINE of mostly-Hebrew text -> the codepoint order satori must paint
 * left-to-right for the line to READ right-to-left.
 */
function toVisualRTL(line: string): string {
  // Split into directional runs: an LTR run is Latin/digits plus any
  // characters sandwiched inside; everything else joins the RTL run.
  const runs: { ltr: boolean; text: string }[] = []
  for (const ch of line) {
    const ltr = isLtrChar(ch)
    const last = runs[runs.length - 1]
    if (last && (last.ltr === ltr || (!isRtlChar(ch) && !ltr && last.ltr === false))) {
      last.text += ch
    } else if (last && last.ltr && !isRtlChar(ch) && !ltr) {
      // neutral (space, punctuation) after Latin: close the Latin run
      runs.push({ ltr: false, text: ch })
    } else {
      runs.push({ ltr, text: ch })
    }
  }
  return runs
    .reverse()
    .map((run) =>
      run.ltr
        ? run.text
        : [...run.text].reverse().map((c) => MIRROR[c] ?? c).join(''),
    )
    .join('')
}

/**
 * Manual line breaking, because wrapping must happen BEFORE visual reordering:
 * satori wrapping a reversed string puts the text's end on the first line.
 * ~30 chars fits the 1040px text column at the large size; balance the split
 * so neither line is a single orphaned word.
 */
function splitLines(title: string): string[] {
  if ([...title].length <= 30) return [title]
  const words = title.split(' ')
  let best = 1
  let bestDiff = Infinity
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ').length
    const b = words.slice(i).join(' ').length
    const diff = Math.abs(a - b)
    if (diff < bestDiff) {
      bestDiff = diff
      best = i
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')]
}

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'PROPEL'

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    mdxPosts.filter((post) => !post.draft).map((post) => ({ lang, slug: post.slug })),
  )
}

const FONT_DIR = join(process.cwd(), 'src', 'assets', 'fonts')

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const locale = isLocale(lang) ? lang : 'he'
  const post = mdxPosts.find((p) => p.slug === slug)

  const title = post?.ogTitle[locale] ?? 'PROPEL'
  const rtl = locale === 'he'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#f7f6f2',
          padding: '72px 80px',
          fontFamily: 'Assistant',
        }}
      >
        {/* The rule at the top - the blueprint language the site itself uses. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ width: 96, height: 6, backgroundColor: '#7a1c09', display: 'flex' }} />
          <div
            style={
              rtl
                ? { fontSize: 26, fontWeight: 400, color: '#5f6259', display: 'flex' }
                : {
                    fontSize: 26,
                    fontWeight: 400,
                    color: '#5f6259',
                    letterSpacing: '0.14em',
                    display: 'flex',
                  }
            }
          >
            {rtl ? toVisualRTL('מהבלוג') : 'FROM THE BLOG'}
          </div>
        </div>

        {/* The headline - the card's one job. Lines pre-split and pre-ordered;
            each renders as its own row so satori never wraps Hebrew itself. */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            fontSize: title.length > 42 ? 62 : 72,
            fontWeight: 700,
            color: '#1f221c',
            lineHeight: 1.15,
            alignItems: rtl ? 'flex-end' : 'flex-start',
          }}
        >
          {splitLines(title).map((line, index) => (
            <div key={index} style={{ display: 'flex' }}>
              {rtl ? toVisualRTL(line) : line}
            </div>
          ))}
        </div>

        {/* The brand line, per the README: PROPEL · propel.co.il */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid rgba(31, 34, 28, 0.14)',
            paddingTop: 32,
          }}
        >
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: '#7a1c09' }}>
            PROPEL
          </div>
          <div style={{ display: 'flex', fontSize: 26, fontWeight: 400, color: '#5f6259' }}>
            propel.co.il
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Assistant',
          data: readFileSync(join(FONT_DIR, 'Assistant-400.ttf')),
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Assistant',
          data: readFileSync(join(FONT_DIR, 'Assistant-700.ttf')),
          weight: 700,
          style: 'normal',
        },
      ],
    },
  )
}
