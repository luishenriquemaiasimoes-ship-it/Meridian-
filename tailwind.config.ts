import type { Config } from 'tailwindcss';

/**
 * MERIDIAN design system.
 * All colours resolve to CSS custom properties defined in src/styles/globals.css
 * so that light / dark themes swap without re-rendering React.
 */
const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--m-canvas) / <alpha-value>)',
        panel: 'rgb(var(--m-panel) / <alpha-value>)',
        raised: 'rgb(var(--m-raised) / <alpha-value>)',
        sunken: 'rgb(var(--m-sunken) / <alpha-value>)',
        line: 'rgb(var(--m-line) / <alpha-value>)',
        'line-strong': 'rgb(var(--m-line-strong) / <alpha-value>)',
        ink: 'rgb(var(--m-ink) / <alpha-value>)',
        'ink-2': 'rgb(var(--m-ink-2) / <alpha-value>)',
        'ink-3': 'rgb(var(--m-ink-3) / <alpha-value>)',
        'ink-4': 'rgb(var(--m-ink-4) / <alpha-value>)',
        accent: 'rgb(var(--m-accent) / <alpha-value>)',
        'accent-soft': 'rgb(var(--m-accent-soft) / <alpha-value>)',
        brass: 'rgb(var(--m-brass) / <alpha-value>)',
        pos: 'rgb(var(--m-pos) / <alpha-value>)',
        neg: 'rgb(var(--m-neg) / <alpha-value>)',
        warn: 'rgb(var(--m-warn) / <alpha-value>)',
        info: 'rgb(var(--m-info) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--m-font-sans)'],
        mono: ['var(--m-font-mono)'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.04em' }],
        xs: ['11px', { lineHeight: '16px' }],
        sm: ['12px', { lineHeight: '17px' }],
        base: ['13px', { lineHeight: '19px' }],
        md: ['14px', { lineHeight: '20px' }],
        lg: ['16px', { lineHeight: '22px' }],
        xl: ['19px', { lineHeight: '26px' }],
        '2xl': ['24px', { lineHeight: '30px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['40px', { lineHeight: '46px' }],
        '5xl': ['52px', { lineHeight: '58px' }],
      },
      borderRadius: { xs: '2px', sm: '3px', DEFAULT: '4px', md: '6px', lg: '8px', xl: '12px' },
      boxShadow: {
        panel: '0 1px 2px rgb(0 0 0 / 0.06), 0 0 0 1px rgb(var(--m-line) / 1)',
        pop: '0 12px 32px -8px rgb(0 0 0 / 0.35), 0 0 0 1px rgb(var(--m-line-strong) / 1)',
        focus: '0 0 0 2px rgb(var(--m-accent) / 0.35)',
      },
      transitionDuration: { DEFAULT: '120ms' },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
      },
      animation: {
        'fade-in': 'fade-in 140ms ease-out',
        'slide-up': 'slide-up 160ms cubic-bezier(0.16,1,0.3,1)',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
