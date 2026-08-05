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
  /** Serif line beneath the wordmark, as on the printed lockup. */
  tagline?: string
  className?: string
}

/*
 * There used to be a `tone` prop here that rendered the wordmark in `--surface`
 * — the page background colour. Its only use was the footer, where it produced
 * 1.04:1 in light and 1.11:1 in dark: an invisible logo in both themes. It was
 * a leftover from the earlier dark-footer design. `--ink` is correct on every
 * surface the mark actually appears on.
 */
export default function Logo({ tagline, className = '' }: Props) {
  const colour = 'text-brand-ink'

  return (
    <span className={`inline-flex flex-col ${tagline ? 'gap-1.5' : ''} ${className}`}>
      {/* The mark stands in for the O, so the text nodes alone read as
          "PR PEL". One label over the lockup restores the company name. */}
      <span
        aria-label="PROPEL"
        role="img"
        className={`font-display inline-flex items-center gap-[0.02em] font-black leading-none tracking-[-0.02em] ${colour}`}
      >
        <span aria-hidden="true">PR</span>
        <ArrowMark />
        <span aria-hidden="true">PEL</span>
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
