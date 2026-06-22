/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0B0F19',
          900: '#141A2B',
          800: '#141A2B',
          700: '#1B2236',
        },
        accent: {
          DEFAULT: '#4C7DFF',
          light: '#3D68E0',
          glow: '#1E2A4A',
        },
        gold: {
          DEFAULT: '#FBBF24',
          light: '#FFD080',
        },
        success: '#34D399',
        danger: '#F87171',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.35)',
        'card-light': '0 4px 24px rgba(0,0,0,0.08)',
        'glow': '0 0 20px rgba(79,142,247,0.25)',
        'glow-sm': '0 0 10px rgba(79,142,247,0.15)',
      },
    },
  },
  plugins: [],
}