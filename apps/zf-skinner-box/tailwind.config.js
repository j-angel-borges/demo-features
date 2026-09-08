/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/shared/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        purpura: {
          DEFAULT: '#533B87',
          dark: '#3C2866',
          light: '#6F52B3',
        },
        lavanda: {
          DEFAULT: '#D6C8FA',
          subtle: '#EAE2FD',
          glow: 'rgba(214, 200, 250, 0.4)',
        },
        menta: {
          DEFAULT: '#C2F4E7',
          light: '#E2FAF3',
          glow: 'rgba(194, 244, 231, 0.4)',
        },
        glacial: {
          DEFAULT: '#EBF1F5',
          card: 'rgba(235, 241, 245, 0.08)',
          glass: 'rgba(235, 241, 245, 0.15)',
        },
        slate: {
          DEFAULT: '#4A5160',
          dark: '#2A303C',
          muted: '#8B94A5',
        },
        dark: {
          DEFAULT: '#080D1A',
          void: '#04070D',
          surface: '#0F1629',
          glass: 'rgba(8, 13, 26, 0.75)',
        },
        amberJackpot: '#FBBF24',
        coralAlert: '#F87171',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'jackpot-shimmer': 'jackpotGlow 2.5s ease-in-out infinite alternate',
        'float-gentle': 'floatGentle 4s ease-in-out infinite',
      },
      keyframes: {
        jackpotGlow: {
          '0%': { boxShadow: '0 0 20px rgba(251, 191, 36, 0.4), inset 0 0 10px rgba(214, 200, 250, 0.3)' },
          '100%': { boxShadow: '0 0 45px rgba(194, 244, 231, 0.8), inset 0 0 25px rgba(251, 191, 36, 0.6)' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
