import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-contrast': 'var(--color-primary-contrast)',
        text: 'var(--color-text)',
        surface: 'var(--color-surface)',
        background: 'var(--color-background)',
        destructive: 'var(--color-destructive)',
        success: 'var(--color-success)',
        alert: 'var(--color-alert)',
        subtitle: 'var(--color-subtitle)',
        'grey-contrast': 'var(--color-grey-contrast)',
        border: 'var(--color-border)',
        'ai-variant': 'var(--color-ai-variant)',
        'ai-border': 'var(--color-ai-border)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
      },
    },
  },
  plugins: [],
};

export default config; 