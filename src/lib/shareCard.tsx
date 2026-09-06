import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import type { Locale } from './i18n'

/**
 * The link-preview card, shared by the article routes and the case studies.
 *
 * It lived inside `blog/[slug]/opengraph-image.tsx` and was copied nowhere,
 * which was correct while one route needed it. The case studies need the same
 * card - one pasted into a WhatsApp group showed the generic brand image, so
 * the strongest sales asset on the site shared as an anonymous rectangle, on a
 * site whose main distribution channel is exactly that paste - and the bidi
 * handling below is not something to reimplement twice.
 *
 * `node:fs` is fine here and would not be in most of `src/`: every route that
 * calls this is statically generated, so it runs at build on Node, never on
 * the edge.
 *
 * THE BIDI PROBLEM, solved by hand because satori does not solve it. Satori
 * paints codepoints in memory order, left to right, regardless of `direction`
 * - the first Hebrew card rendered every word letter-reversed (verified by
 * screenshot: the Hebrew for "from the blog" painted backwards). So Hebrew
 * text goes through toVisualRTL(): lines are split manually (satori's own
 * wrapping would put the reversed lines in the wrong vertical order), and each
 * line is reordered into visual form - runs reversed, Hebrew runs
 * letter-reversed, Latin/digit runs kept intact, mirrored brackets swapped.
 * The Latin handling exists because a title containing "WordPress" would
 * otherwise break silently. Verified by rendering the PNGs and reading them,
 * not by trusting this comment.
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

export const shareCardSize = { width: 1200, height: 630 }
export const shareCardContentType = 'image/png'

const FONT_DIR = join(process.cwd(), 'src', 'assets', 'fonts')

/**
 * @param eyebrow The small label above the headline, already in `lang`.
 * @param title   The headline. The card's one job.
 */
export function shareCard({
  lang,
  eyebrow,
  title,
}: {
  lang: Locale
  eyebrow: string
  title: string
}): ImageResponse {
  const rtl = lang === 'he'

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
            {rtl ? toVisualRTL(eyebrow) : eyebrow}
          </div>
        </div>

        {/* The headline. Lines pre-split and pre-ordered; each renders as its
            own row so satori never wraps Hebrew itself. */}
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

        {/* The brand line, per the README: PROPEL and the domain. */}
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
      ...shareCardSize,
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
