/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      cursor: {
        crosshair: 'crosshair', // O utiliza una URL personalizada.
      },
    },
  },
  plugins: [],
}