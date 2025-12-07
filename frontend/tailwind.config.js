/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: { 
      keyframes: {
        fadein: {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" }
        }
      },
      scale: {
        101: '1.01',
      },
      screens: {
        'xs': '450px',
      }
    },
  },
  plugins: [],
};
