/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rf: {
          bg: '#070B14',
          'bg-primary': '#070B14',
          'bg-alt': '#0D1422',
          surface: '#0D1526',
          'surface-elevated': '#111B2E',
          card: '#111B2E',
          'card-elevated': '#162238',
          border: '#24324A',
          'border-subtle': '#1B273D',
          'border-focus': '#2DD4BF',
          teal: '#14B8A6',
          'teal-bright': '#2DD4BF',
          blue: '#38BDF8',
          violet: '#8B5CF6',
          amber: '#F59E0B',
          text: '#F8FAFC',
          'text-primary': '#F8FAFC',
          'text-secondary': '#CBD5E1',
          'text-muted': '#94A3B8',
        },
        brand: {
          50: '#f0fdf9',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#24324A',
          800: '#162238',
          900: '#111B2E',
          950: '#070B14',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.1)',
        card: '0 4px 12px -2px rgba(3, 7, 18, 0.4), 0 2px 6px -2px rgba(3, 7, 18, 0.3)',
        panel: '0 12px 28px -4px rgba(3, 7, 18, 0.6), 0 8px 16px -4px rgba(3, 7, 18, 0.4)',
        glow: '0 0 20px -5px rgba(20, 184, 166, 0.15)',
      }
    },
  },
  plugins: [],
}
