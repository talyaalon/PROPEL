import type { Config } from 'tailwindcss'

/*
 * ── The accent ────────────────────────────────────────────────────────────────
 * PROPEL runs on one accent hue: the dark red from the printed logo.
 *
 * It needs two values, not one. Measured against the two surfaces:
 *
 *              on #f6f5f1 light    on #24271f dark
 *   #7a1c09       9.6:1 (AAA)          1.4:1 (fails)
 *   #ff5347       3.3:1 (large only)   4.8:1 (AA)
 *
 * The dark value has been wrong twice by reading as orange - see the long note
 * above --accent in globals.css, which records why hue matching was the wrong
 * test and the green channel is the right one.
 *
 * A single red cannot serve both themes - dark red on a dark surface is not
 * merely dull, it is unreadable. So the accent is a CSS variable that flips with
 * the theme, declared once in globals.css. Everything downstream reads
 * `brand.accent` and never a literal.
 *
 * One consequence worth knowing: because these are bare `var()` values with no
 * `<alpha-value>` placeholder, Tailwind cannot generate opacity modifiers from
 * them. `border-brand-accent/40` compiles to nothing at all, silently, and the
 * element falls through to a hardcoded preflight grey. Check with
 * `npm run audit -- css <class>` before assuming a class does what it reads as.
 */

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    /*
     * Zero corner radius across the whole site, buttons and cards included.
     *
     * Declared at `theme` level rather than `extend` so it replaces Tailwind's
     * scale outright: every `rounded-*` utility in the codebase - `rounded-full`
     * included - collapses to square without editing each call site.
     */
    borderRadius: {
      none: '0px',
      DEFAULT: '0px',
      sm: '0px',
      md: '0px',
      lg: '0px',
      xl: '0px',
      '2xl': '0px',
      '3xl': '0px',
      full: '0px',
    },

    /*
     * The spacing scale in px rather than rem.
     *
     * Every value here is identical to Tailwind's default at the default root
     * size - `p-6` is 24px either way - so nothing moves at 100%. What changes
     * is the coupling.
     *
     * Tailwind's scale is rem-based, which means padding, gaps and fixed widths
     * all grow in lockstep with the root font size. That is exactly wrong for a
     * text-size control: at 200% a card's own padding doubled to 96px inside a
     * 375px viewport, so the content had 215px to fit into and the grid
     * overflowed the screen by 84px. Measured, before this change: fine to
     * 150%, then reflow failure.
     *
     * Type scales, chrome does not. That separation is what lets the
     * accessibility menu offer 200% and satisfy 1.4.4 rather than appear to.
     *
     * Declared at `theme` level so it replaces the default scale outright -
     * under `extend` the rem values would survive alongside these.
     */
    spacing: Object.fromEntries([
      ['px', '1px'],
      ['0', '0px'],
      ...[
        0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40,
        44, 48, 52, 56, 60, 64, 72, 80, 96,
      ].map((step) => [String(step), `${step * 4}px`]),
    ]),

    extend: {
      colors: {
        brand: {
          /*
           * Semantic tokens. These resolve through CSS variables so a single set
           * of utility classes serves both themes - no `dark:` variant on every
           * element, and no duplicated markup.
           */
          surface: 'var(--surface)',
          header: 'var(--header)',
          raised: 'var(--raised)',
          panel: 'var(--panel)',
          ink: 'var(--ink)',
          slate: 'var(--slate)',
          line: 'var(--line)',
          /* Form controls only. `--line` is too faint to identify an input
             (1.4.11 wants 3:1) but correct everywhere else. */
          field: 'var(--field-border)',
          success: 'var(--success)',
          successSoft: 'var(--success-soft)',
          /* No `silver` alias: --silver itself is load-bearing (the logo's
             arrow-disc gradient reads it) but no utility class ever did. */
          accent: 'var(--accent)',
          accentSoft: 'var(--accent-soft)',
          accentFaint: 'var(--accent-faint)',
          accentWash: 'var(--accent-wash)',
          /* Readable on the accent - the accent's own foreground, not the page's. */
          onAccent: 'var(--on-accent)',
          band: 'var(--band)',
        },
      },

      /*
       * One family, on the owner's instruction: Assistant, everywhere.
       *
       * It replaces a four-family system - Chakra Petch for Latin display,
       * Heebo for Hebrew display, Frank Ruhl Libre for Hebrew headings and the
       * serif tagline, Assistant for body. That system existed to solve a real
       * problem (Chakra Petch has no Hebrew glyphs, so Hebrew fell through per
       * character to a Hebrew face) and it worked, but it cost 95-126KB per
       * page across nine woff2 files - the largest asset class on the site,
       * ahead of every image.
       *
       * Assistant is variable, carries Hebrew and Latin in one file, and was
       * already being downloaded. The role names stay so no call site changes:
       * `font-display`, `font-heading` and `font-serif` all resolve here, and
       * weight and letter-spacing continue to do the work of distinguishing a
       * heading from body text.
       */
      fontFamily: {
        display: ['var(--font-assistant)', 'sans-serif'],
        heading: ['var(--font-assistant)', 'sans-serif'],
        body: ['var(--font-assistant)', 'sans-serif'],
        serif: ['var(--font-assistant)', 'sans-serif'],
      },

      transitionTimingFunction: {
        smooth: 'cubic-bezier(.16,1,.3,1)',
      },

      keyframes: {
        'underline-grow': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      animation: {
        'underline-grow': 'underline-grow 0.68s cubic-bezier(.16,1,.3,1) 0.5s both',
        'fade-up-delay': 'fade-up 0.68s cubic-bezier(.16,1,.3,1) 0.15s both',
        'fade-up-delay-2': 'fade-up 0.68s cubic-bezier(.16,1,.3,1) 0.3s both',
        'fade-in': 'fade-in 0.68s cubic-bezier(.16,1,.3,1) 0.4s both',
        'slide-down': 'slide-down 0.2s cubic-bezier(.16,1,.3,1) both',
      },
    },
  },
  plugins: [],
}

export default config
