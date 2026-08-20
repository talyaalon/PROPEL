'use client'

import { useState } from 'react'
import { Lock, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Locale } from '@/lib/i18n'
import type { Bilingual } from '@/content/projects'

/**
 * Evidence for a system that lives behind a login.
 *
 * Two of the strongest projects in this portfolio are internal tools. A
 * visitor could only see a lock icon and the sentence "private project - the
 * system is behind a login", which proves nothing: it asks to be believed at
 * exactly the moment the site should be showing.
 *
 * This renders whatever media the content file supplies - screen recordings
 * with dummy data, stills - and keeps the honest placeholder for as long as
 * there is none. **Nothing here is fabricated.** No mock screenshots, no
 * generated images: an invented screenshot of a system nobody can open is the
 * one lie this site cannot afford.
 *
 * Video, not autoplay-everything: a recording starts only when the visitor
 * asks. `preload="none"` keeps a multi-megabyte capture off the critical path
 * of a page that may never be scrolled that far, and honours the site's motion
 * contract - nothing moves that the visitor did not start.
 */

export type ShowcaseMedia = {
  src: string
  poster?: string
  caption: Bilingual
}

type Props = {
  media?: ShowcaseMedia[]
  lang: Locale
  /** Shown when there is no media yet. */
  placeholderLabel: string
  /** Accessible name for the gallery region. */
  ariaLabel: string
  prevLabel: string
  nextLabel: string
}

const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src)

export default function PrivateProjectShowcase({
  media,
  lang,
  placeholderLabel,
  ariaLabel,
  prevLabel,
  nextLabel,
}: Props) {
  const [index, setIndex] = useState(0)

  if (!media || media.length === 0) {
    /*
     * The placeholder, unchanged from what the portfolio card already used: a
     * grey box with grey text reads as a screenshot that failed to load, which
     * is worse than an empty frame. The lock says "this is deliberate" before
     * the sentence is read.
     */
    return (
      <div className="flex min-h-[176px] flex-col items-center justify-center gap-3 border border-brand-line bg-brand-panel px-6 py-10 text-center">
        <span className="flex h-11 w-11 items-center justify-center border border-brand-accent text-brand-accent">
          <Lock className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="max-w-[220px] text-[0.875rem] leading-relaxed text-brand-slate">
          {placeholderLabel}
        </span>
      </div>
    )
  }

  const current = media[index]
  const many = media.length > 1
  // Logical direction: in Hebrew "previous" is the right-pointing chevron.
  const PrevIcon = lang === 'he' ? ChevronRight : ChevronLeft
  const NextIcon = lang === 'he' ? ChevronLeft : ChevronRight

  const go = (delta: number) => setIndex((i) => (i + delta + media.length) % media.length)

  return (
    <figure className="flex flex-col gap-3" aria-label={ariaLabel}>
      <div className="relative border border-brand-ink bg-brand-panel">
        {isVideo(current.src) ? (
          <video
            key={current.src}
            src={current.src}
            poster={current.poster}
            controls
            preload="none"
            playsInline
            className="block h-auto w-full"
            aria-label={current.caption[lang]}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element -- the owner
             supplies these at unknown dimensions; next/image needs them up
             front and would fail the build on the first mismatch. */
          <img
            src={current.src}
            alt={current.caption[lang]}
            loading="lazy"
            className="block h-auto w-full"
          />
        )}
      </div>

      <figcaption className="flex items-center justify-between gap-4 text-[0.875rem] text-brand-slate">
        <span className="min-w-0 break-words">{current.caption[lang]}</span>

        {many && (
          <span className="flex flex-shrink-0 items-center gap-1">
            {/* `aria-live` on the counter, not the media: a screen reader
                should hear "2 of 4" on change without the whole figure being
                re-announced. */}
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={prevLabel}
              className="flex h-8 w-8 items-center justify-center border border-brand-line text-brand-ink transition-colors duration-200 hover:border-brand-accent hover:text-brand-accent"
            >
              <PrevIcon className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="num px-2 text-[0.75rem]" aria-live="polite" dir="ltr">
              {index + 1}/{media.length}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={nextLabel}
              className="flex h-8 w-8 items-center justify-center border border-brand-line text-brand-ink transition-colors duration-200 hover:border-brand-accent hover:text-brand-accent"
            >
              <NextIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </span>
        )}
      </figcaption>
    </figure>
  )
}
