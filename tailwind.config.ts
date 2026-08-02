import type { Config } from 'tailwindcss'

/*
 * ── The accent ────────────────────────────────────────────────────────────────
 * PROPEL runs on a single accent hue. It is declared here, once, and everything
 * downstream — Tailwind utilities, the component layer in globals.css, the
 * scroll progress bar — reads it from `brand.accent` / `brand.accentDeep`.
 * Changing the brand accent is a one-line edit to these two constants.
 */
const ACCENT = '#C8FF3D'
const ACCENT_DEEP = '#A6E01F'

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
     * scale outright: the 78 `rounded-*` utilities already in the codebase —
     * `rounded-full` among them — collapse to square without editing each call
     * site. The keys are kept rather than dropped so existing classes still
     * generate instead of silently vanishing.
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

    extend: {
      colors: {
        brand: {
          // Surfaces
          void: '#090316',
          deep: '#050210',
          // Type
          ink: '#FFF8EF',
          lead: '#DED2EC',
          muted: '#AAA0BA',
          // Accent — single hue, see above
          accent: ACCENT,
          accentDeep: ACCENT_DEEP,
          // Retained light-theme surface
          cream: '#F9F7F2',
          // Structural
          line: 'rgba(255,248,239,.15)',
          panel: 'rgba(8,9,11,.9)',
        },
      },

      fontFamily: {
        /*
         * Chakra Petch carries no Hebrew glyphs, and that is the mechanism
         * rather than a limitation: Latin and digits render in its technical
         * letterforms while Hebrew falls through to Heebo automatically, per
         * character, with no locale branching anywhere in the markup.
         */
        display: ['var(--font-chakra)', 'var(--font-heebo)', 'sans-serif'],
        body: ['var(--font-assistant)', 'var(--font-heebo)', 'sans-serif'],
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
        'fade-up': 'fade-up 0.68s cubic-bezier(.16,1,.3,1) both',
        'fade-up-delay': 'fade-up 0.68s cubic-bezier(.16,1,.3,1) 0.15s both',
        'fade-up-delay-2': 'fade-up 0.68s cubic-bezier(.16,1,.3,1) 0.3s both',
        'fade-up-delay-3': 'fade-up 0.68s cubic-bezier(.16,1,.3,1) 0.45s both',
        'fade-in': 'fade-in 0.68s cubic-bezier(.16,1,.3,1) 0.4s both',
        'slide-down': 'slide-down 0.2s cubic-bezier(.16,1,.3,1) both',
      },
    },
  },
  plugins: [],
}

export default config
