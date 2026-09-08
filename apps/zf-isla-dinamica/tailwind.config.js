/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        zentry: {
          purpura: '#533B87',
          lavanda: '#D6C8FA',
          menta: '#C2F4E7',
          glacial: '#EBF1F5',
          slate: '#4A5160',
          dark: '#080D1A',
          amberJackpot: '#FBBF24',
          coralAlert: '#F87171',
          cyanStream: '#38BDF8',
          emeraldOnline: '#34D399',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'voice-wave': 'wave 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        wave: {
          '0%': { transform: 'scaleY(0.4)' },
          '100%': { transform: 'scaleY(1.4)' },
        },
      },
    },
  },
  plugins: [],
};
