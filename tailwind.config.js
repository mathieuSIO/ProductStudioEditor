/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 45px -25px rgba(28, 25, 23, 0.28)',
      },
    },
  },
  plugins: [],
}
