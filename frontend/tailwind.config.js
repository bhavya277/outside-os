/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#0a1711',
          900: '#0f241a',
          800: '#1b382b',
          700: '#284d3d',
          600: '#38634f',
        },
        moss: {
          700: '#3e5843',
          600: '#4a6b53',
          500: '#608269',
          400: '#7c9e85',
          300: '#a3beab',
          100: '#e5ece7',
        },
        ivory: {
          50: '#fdfcf9',
          100: '#fbf9f3',
          200: '#f5f0e6',
          300: '#ede6d6',
          400: '#dfd4be',
          500: '#c5b597',
        },
        terracotta: {
          600: '#b24f1b',
          500: '#c86432',
          400: '#d97736',
          300: '#e69055',
          200: '#f4ba91',
        },
        contour: 'rgba(27, 56, 43, 0.08)',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'field': '0 4px 20px -2px rgba(15, 36, 26, 0.08), 0 2px 6px -1px rgba(15, 36, 26, 0.04)',
        'field-lg': '0 12px 32px -4px rgba(15, 36, 26, 0.12), 0 4px 12px -2px rgba(15, 36, 26, 0.06)',
      }
    },
  },
  plugins: [],
}
