import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Preflight enabled — antd has been fully removed
  theme: {
    extend: {
      colors: {
        // Map existing CSS variable system into Tailwind
        border: 'var(--border-color)',
        'border-light': 'var(--border-light)',
        input: 'var(--bg-tertiary)',
        ring: 'var(--color-primary)',
        background: 'var(--bg-primary)',
        foreground: 'var(--text-primary)',

        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          foreground: '#fff',
        },
        secondary: {
          DEFAULT: 'var(--bg-secondary)',
          foreground: 'var(--text-secondary)',
        },
        destructive: {
          DEFAULT: 'var(--color-error)',
          foreground: '#fff',
        },
        muted: {
          DEFAULT: 'var(--bg-tertiary)',
          foreground: 'var(--text-muted)',
        },
        accent: {
          DEFAULT: 'var(--bg-hover)',
          foreground: 'var(--text-primary)',
        },
        popover: {
          DEFAULT: 'var(--bg-secondary)',
          foreground: 'var(--text-primary)',
        },
        card: {
          DEFAULT: 'var(--bg-card)',
          hover: 'var(--bg-card-hover)',
          foreground: 'var(--text-primary)',
        },

        // Semantic colors
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',

        // Severity
        'severity-critical': 'var(--severity-critical)',
        'severity-high': 'var(--severity-high)',
        'severity-medium': 'var(--severity-medium)',
        'severity-low': 'var(--severity-low)',
        'severity-info': 'var(--severity-info)',

        // Chart palette
        'chart-1': 'var(--chart-1)',
        'chart-2': 'var(--chart-2)',
        'chart-3': 'var(--chart-3)',
        'chart-4': 'var(--chart-4)',
        'chart-5': 'var(--chart-5)',
        'chart-6': 'var(--chart-6)',
        'chart-7': 'var(--chart-7)',
        'chart-8': 'var(--chart-8)',
      },
      borderRadius: {
        lg: 'var(--card-radius)',
        md: '6px',
        sm: '4px',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        display: 'var(--text-display)',
      },
      spacing: {
        '2xs': 'var(--space-2xs)',
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
        '3xl': 'var(--space-3xl)',
        '4xl': 'var(--space-4xl)',
        page: 'var(--space-page)',
        'header-h': 'var(--space-header-h)',
        'sidebar-w': 'var(--space-sidebar-w)',
        'sidebar-collapsed': 'var(--space-sidebar-collapsed)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        card: 'var(--card-shadow)',
        'card-hover': 'var(--card-shadow-hover)',
        glass: 'var(--glass-shadow)',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'logs-fade-in': 'logs-fade-in 0.35s ease',
        'oboard-shimmer': 'oboard-shimmer 1.5s infinite',
        'oboard-slide-in': 'oboard-slide-in 0.2s ease-out',
        'oqb-pill-in': 'oqb-pill-in 0.15s ease',
        'oqb-fade-in': 'oqb-fade-in 0.12s ease',
        'trp-slide-in': 'trp-slide-in 0.18s cubic-bezier(.16,1,.3,1)',
        'waterfall-bar-enter': 'waterfall-bar-enter 0.4s ease-out forwards',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'logs-fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'oboard-shimmer': {
          '0%': { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
        'oboard-slide-in': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'oqb-pill-in': {
          from: { transform: 'scale(0.88)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'oqb-fade-in': {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'trp-slide-in': {
          from: { opacity: '0', transform: 'translateY(-6px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'waterfall-bar-enter': {
          from: { opacity: '0', transform: 'scaleX(0.5)' },
          to: { opacity: '0.85', transform: 'scaleX(1)' },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
