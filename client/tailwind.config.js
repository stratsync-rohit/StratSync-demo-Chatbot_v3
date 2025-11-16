/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2A63F6',
        'primary-dark': '#1E4AE6',
      },
      animation: {
        'bounce': 'bounce 1.4s infinite',
      },
    },
  },
  plugins: [],
};