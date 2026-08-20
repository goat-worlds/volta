import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: 'rgb(var(--color-brand) / <alpha-value>)',
        'brand-dark': 'rgb(var(--color-brand-dark) / <alpha-value>)',
        'bg-light': 'rgb(var(--color-bg-light) / <alpha-value>)',
        'bg-dark': 'rgb(var(--color-bg-dark) / <alpha-value>)',
        'surface-light': 'rgb(var(--color-surface-light) / <alpha-value>)',
        'surface-dark': 'rgb(var(--color-surface-dark) / <alpha-value>)',
        'text-on-light': 'rgb(var(--color-text-on-light) / <alpha-value>)',
        'text-on-light-muted': 'rgb(var(--color-text-on-light-muted) / <alpha-value>)',
        'text-on-dark': 'rgb(var(--color-text-on-dark) / <alpha-value>)',
        'text-on-dark-muted': 'rgb(var(--color-text-on-dark-muted) / <alpha-value>)',
        'border-dark': 'rgb(var(--color-border-dark) / <alpha-value>)',
        'border-dark-hover': 'rgb(var(--color-border-dark-hover) / <alpha-value>)',
        'status-compliant': 'rgb(var(--color-status-compliant) / <alpha-value>)',
        'status-high': 'rgb(var(--color-status-high) / <alpha-value>)',
        'status-critical': 'rgb(var(--color-status-critical) / <alpha-value>)',
      },
    },
  },
  plugins: [],
} satisfies Config
