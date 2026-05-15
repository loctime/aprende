import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.mdx',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        bg: { DEFAULT: '#0b0f17', soft: '#0f172a', card: '#111827' },
        ink: { DEFAULT: '#e2e8f0', dim: '#94a3b8', muted: '#64748b' },
        brand: { DEFAULT: '#2563eb', soft: '#1e3a8a' },
      },
    },
  },
  plugins: [],
}
export default config
