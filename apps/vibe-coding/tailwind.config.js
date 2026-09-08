/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        zentry: {
          primary: '#533B87',
          'primary-light': '#7A59BF',
          lavender: '#D6C8FA',
          mint: '#C2F4E7',
          glow: '#00F2FE',
          'dark-neutral': '#4A5160',
          'dark-canvas': '#0A0813',
          'light-canvas': '#F8F6FE',
        },
      },
      fontFamily: {
        sans: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass-card': '0 8px 32px 0 rgba(83, 59, 135, 0.12)',
        'glass-glow': '0 0 25px rgba(0, 242, 254, 0.45)',
        'pond-glow': '0 0 35px rgba(214, 200, 250, 0.55)',
      },
    },
  },
  plugins: [],
};
