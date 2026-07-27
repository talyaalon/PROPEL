import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-cream': '#F9F7F2',
        'brand-black': '#111111',
        'brand-charcoal': '#1C1C1C',
        'brand-steel': '#6B7280',
        'brand-light-steel': '#9CA3AF',
        'brand-border': '#DDD9D2',
      },
      fontFamily: {
        assistant: ['var(--font-assistant)', 'sans-serif'],
        'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
        raleway: ['var(--font-raleway)', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.03)',
        card: '0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        'card-hover': '0 16px 48px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06)',
        nav: '0 1px 3px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.05)',
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
        'underline-grow':
          'underline-grow 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both',
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-up-delay':
          'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both',
        'fade-up-delay-2':
          'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both',
        'fade-up-delay-3':
          'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.45s both',
        'fade-in': 'fade-in 0.8s ease 0.6s both',
        'slide-down': 'slide-down 0.22s cubic-bezier(0.25, 1, 0.5, 1) both',
      },
    },
  },
  plugins: [],
}

export default config
