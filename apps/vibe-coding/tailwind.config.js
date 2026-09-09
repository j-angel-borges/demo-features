/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/shared/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        zentry: {
          purpura: '#533B87',
          'purpura-vibrante': '#7A59BF',
          lavanda: '#D6C8FA',
          menta: '#C2F4E7',
          glacial: '#EBF1F5',
          glow: '#00F2FE',
          slate: '#4A5160',
          dark: '#080D1A',
          'dark-canvas': '#0A0813',
          'light-canvas': '#F8F6FE',
          amber: '#FBBF24',
          coral: '#F87171',
          cyan: '#38BDF8',
          emerald: '#34D399',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'bounce-subtle': 'bounceSubtle 3s infinite ease-in-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 15px rgba(83, 59, 135, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 25px rgba(194, 244, 231, 0.8))' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
