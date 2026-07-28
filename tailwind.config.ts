import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    /*
     * Zero corner radius across the whole site.
     *
     * Declared at `theme` level rather than `extend` so it replaces Tailwind's
     * scale outright: every `rounded-*` utility already in the codebase — 78 of
     * them, including `rounded-full` — collapses to square without touching each
     * call site. The keys are kept (rather than dropping the scale) so existing
     * classes still generate rather than silently vanishing.
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
          // Accents
          gold: '#FFD36A',
          goldDeep: '#FFB000',
          cyan: '#39C8FF',
          pink: '#FF3DAE',
          // Retained light-theme surface
          cream: '#F9F7F2',
        },
      },

      fontFamily: {
        /*
         * Chakra Petch first for Latin and numerals, Heebo behind it for Hebrew.
         * Chakra Petch has no Hebrew glyphs, so Hebrew text falls through to
         * Heebo automatically — which is exactly the intended split.
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
        'underline-grow': 'underline-grow 0.9s cubic-bezier(.16,1,.3,1) 0.5s both',
        'fade-up': 'fade-up 0.68s cubic-bezier(.16,1,.3,1) both',
        'fade-up-delay': 'fade-up 0.68s cubic-bezier(.16,1,.3,1) 0.15s both',
        'fade-up-delay-2': 'fade-up 0.68s cubic-bezier(.16,1,.3,1) 0.3s both',
        'fade-up-delay-3': 'fade-up 0.68s cubic-bezier(.16,1,.3,1) 0.45s both',
        'fade-in': 'fade-in 0.68s cubic-bezier(.16,1,.3,1) 0.4s both',
        'slide-down': 'slide-down 0.22s cubic-bezier(.16,1,.3,1) both',
      },
    },
  },
  plugins: [],
}

export default config
