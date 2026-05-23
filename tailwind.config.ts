import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:   'var(--color-brand-primary)',
          accent:    'var(--color-brand-accent)',
          secondary: 'var(--color-brand-secondary)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          muted:   'var(--color-surface-muted)',
          inset:   'var(--color-surface-inset)',
          inverse: 'var(--color-brand-primary)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong:  'var(--color-border)',
        },
        text: {
          primary:   'var(--color-text-dark)',
          secondary: 'var(--color-text-muted)',
          muted:     'var(--color-text-muted)',
          inverse:   'var(--color-text-light)',
          accent:    'var(--color-brand-accent)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body:    ['var(--font-body)'],
        mono:    ['var(--font-mono)'],
      },
      fontSize: {
        xs:    ['var(--text-xs)'],
        sm:    ['var(--text-sm)'],
        base:  ['var(--text-base)'],
        lg:    ['var(--text-lg)'],
        xl:    ['var(--text-xl)'],
        '2xl': ['var(--text-2xl)'],
        '3xl': ['var(--text-3xl)'],
        '4xl': ['var(--text-4xl)'],
        hero:  ['var(--text-hero)'],
      },
      boxShadow: {
        xs:     'var(--shadow-xs)',
        sm:     'var(--shadow-xs)',
        md:     'var(--shadow-xs)',
        lg:     'var(--shadow-xs)',
        xl:     'var(--shadow-xs)',
        '2xl':  'var(--shadow-xs)',
        accent: 'var(--shadow-xs)',
      },
      borderRadius: {
        xs:    'var(--radius-xs)',
        sm:    'var(--radius-sm)',
        md:    'var(--radius-md)',
        lg:    'var(--radius-lg)',
        xl:    'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      screens: {
        sm:    '480px',
        md:    '768px',
        lg:    '1024px',
        xl:    '1280px',
        '2xl': '1440px',
      },
    },
  },
} satisfies Config
