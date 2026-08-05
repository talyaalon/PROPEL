/**
 * The PROPEL wordmark, drawn to match the printed logo.
 *
 * Three things carried over from it:
 *  - the wordmark in the warm near-black
 *  - a silver disc standing in for the O, with the accent-red arrow rising
 *    out of it
 *  - the serif tagline beneath, also in the accent red
 *
 * Rendered as text and inline SVG rather than as an image file so it stays
 * sharp at any size, inherits the theme, and needs no alt text to maintain.
 * The earlier SVG-through-<img> approach could not reach the page's webfonts
 * and fell back to a different face on every operating system.
 */

type Props = {
  /** `dark` renders on the dark footer panel. */
  tone?: 'light' | 'dark'
  /** Serif line beneath the wordmark, as on the printed lockup. */
  tagline?: string
  className?: string
}

export default function Logo({ tone = 'light', tagline, className = '' }: Props) {
  // Charcoal on paper, paper on charcoal. The mark is never the accent — that
  // is how the printed logo reads, and it keeps the red for calls to action.
  const colour = tone === 'dark' ? 'text-brand-surface' : 'text-brand-ink'

  return (
    <span className={`inline-flex flex-col ${tagline ? 'gap-1.5' : ''} ${className}`}>
      <span
        className={`font-display inline-flex items-center gap-[0.02em] font-black leading-none tracking-[-0.02em] ${colour}`}
      >
        PR
        <ArrowMark />
        PEL
      </span>

      {tagline && (
        <span className="tagline text-brand-accent text-[0.4em] leading-snug">{tagline}</span>
      )}
    </span>
  )
}

/** The silver disc with the red arrow rising out of it, replacing the O. */
function ArrowMark() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="inline-block h-[0.86em] w-[0.86em] flex-shrink-0"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="propel-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--silver)" stopOpacity="0.5" />
          <stop offset="45%" stopColor="var(--silver)" />
          <stop offset="100%" stopColor="var(--silver)" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="47" fill="url(#propel-mark)" />
      {/* The arrow is the accent red in the artwork, not a cut-out */}
      <path
        d="M30 72 L62 40"
        stroke="var(--accent)"
        strokeWidth="13"
        strokeLinecap="square"
        fill="none"
      />
      <path d="M43 30 L74 26 L70 57 Z" fill="var(--accent)" />
    </svg>
  )
}
