/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: ["./public/index.html", "./src/**/*.{html,js,tsx}"],
  theme: {
    fontFamily: {
      sans: ['Roboto Flex', 'sans-serif'],
    },
    extend: {
      colors: {
        'primary': colors.emerald
      },
      spacing: {
        '8xl': '96rem',
        '9xl': '128rem',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    }
  },
  plugins: [],
};
