/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#06080F',
          900: '#0A0D18',
          850: '#0E1424',
          800: '#141D33',
          750: '#19243E',
          700: '#1E293B',
          600: '#334155'
        },
        brand: {
          purple: '#8B5CF6',
          violet: '#A78BFA',
          blue: '#3B82F6',
          cyan: '#38BDF8',
          teal: '#14B8A6',
          emerald: '#10B981',
          rose: '#F43F5E'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
