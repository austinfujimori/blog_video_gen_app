/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-dark-gray': 'rgb(15, 15, 15)',
      },
      fontFamily: {
        quicksand: ['Quicksand', 'sans-serif'],
      },
      boxShadow: {
        'text-lg': '0 2px 4px rgba(0, 0, 0, 0.10)',
        'text-xl': '0 4px 6px rgba(0, 0, 0, 0.10)',
        'text-2xl': '0 10px 15px rgba(0, 0, 0, 0.10)',
      },
      textShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'default': '0 2px 4px rgba(0, 0, 0, 0.10)',
        'md': '0 3px 6px rgba(0, 0, 0, 0.15)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.20)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.25)',
        '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
      },
      screens: {
        xs: "330px",
      },
    },
  },
  variants: {},
  plugins: [
    require("@tailwindcss/forms"),
    require("@headlessui/tailwindcss"),
    function ({ addUtilities }) {
      const newUtilities = {
        '.text-shadow-sm': {
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        },
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.10)',
        },
        '.text-shadow-md': {
          textShadow: '0 3px 6px rgba(0, 0, 0, 0.15)',
        },
        '.text-shadow-lg': {
          textShadow: '0 10px 15px rgba(0, 0, 0, 0.20)',
        },
        '.text-shadow-xl': {
          textShadow: '0 20px 25px rgba(0, 0, 0, 0.25)',
        },
        '.text-shadow-2xl': {
          textShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
};
