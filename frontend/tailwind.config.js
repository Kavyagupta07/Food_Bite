/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#EEE5D3", // Light Beige/Cream background
          charcoal: "#222052", // Deep Navy
          card: "#FFFFFF", // White cards for contrast
          green: "#D2B68A", // Accent Gold/Tan
          glow: "rgba(210, 182, 138, 0.4)", // Gold Glow
          gray: "#B7B7B7", // Silver/Grey
          beige: "#EEE5D3",
          textMuted: "#7A757D", // Warm dark-grey for muted body text
          navy: "#222052",
          gold: "#D2B68A",
          border: "#D2B68A"
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
