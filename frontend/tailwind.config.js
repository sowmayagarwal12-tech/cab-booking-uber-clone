/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uber: {
          black: '#000000',
          dark: '#121212',
          card: '#1e1e1e',
          accent: '#276EF1',
          gold: '#FFC043',
          green: '#05A357',
          gray: '#545454',
          lightgray: '#EEEEEE'
        }
      }
    },
  },
  plugins: [],
}
