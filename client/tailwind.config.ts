import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        espresso: {
          50: '#faf6f1',
          100: '#f2e8d9',
          200: '#e4d0b2',
          300: '#d3b285',
          400: '#c09258',
          500: '#ab7535',
          600: '#935f27',
          700: '#7a4c1e',
          800: '#5E3516',
          900: '#3d2010',
          950: '#211008',
        },
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(94, 53, 22, 0.08), 0 10px 20px -2px rgba(94, 53, 22, 0.05)',
        'card': '0 1px 3px rgba(94, 53, 22, 0.06), 0 20px 25px -5px rgba(94, 53, 22, 0.10)',
        'warm': '0 4px 24px -4px rgba(94, 53, 22, 0.15)',
      },
    },
  },
  plugins: [],
} satisfies Config;
