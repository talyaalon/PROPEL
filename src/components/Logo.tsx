/**
 * The PROPEL wordmark.
 *
 * Rendered as HTML text in Raleway rather than as an SVG image, because the
 * previous `he-logo.svg` / `en-logo.svg` / `logo-white.svg` files drew the
 * wordmark with `<text font-family="Raleway">`. An SVG loaded through <img> is
 * rendered in an isolated document with no access to the page's webfonts, so
 * Raleway never applied: the logo fell back to Arial Black on Windows and to
 * something else again on macOS and Linux. The first thing every visitor saw
 * was a mark that looked different on every machine.
 *
 * As text it uses the same Raleway the rest of the site loads, so it is
 * identical everywhere, sharp at any zoom, selectable, and readable by screen
 * readers without an alt attribute to maintain. It also removes the
 * width/height guess that did not match the SVG's own viewBox.
 *
 * When a designed logo exists, swap the span for next/image here — every usage
 * site goes through this component.
 */

type Props = {
  /** `dark` renders for the black footer. */
  tone?: 'light' | 'dark'
  className?: string
}

export default function Logo({ tone = 'light', className = '' }: Props) {
  return (
    <span
      className={`font-display inline-flex items-baseline gap-[0.14em] font-black leading-none tracking-[-0.035em] ${
        tone === 'dark' ? 'text-brand-ink' : 'text-brand-surface'
      } ${className}`}
    >
      PROPEL
      {/* Accent dot, carried over from the original mark */}
      <span
        className="inline-block h-[0.16em] w-[0.16em] flex-shrink-0 rounded-full bg-current"
        aria-hidden="true"
      />
    </span>
  )
}
