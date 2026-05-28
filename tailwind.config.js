/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0A0E1A',
          900: '#0F1629',
          800: '#1A2040',
          700: '#243060',
        },
        accent: {
          DEFAULT: '#4F8EF7',
          light: '#7AAEFF',
          glow: '#4F8EF720',
        },
        gold: {
          DEFAULT: '#F5A623',
          light: '#FFD080',
        },
        success: '#22D3A5',
        danger: '#F75F5F',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.35)',
        'glow': '0 0 20px rgba(79,142,247,0.25)',
        'glow-sm': '0 0 10px rgba(79,142,247,0.15)',
      },
    },
  },
  plugins: [],
}
