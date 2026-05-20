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
          black: "#1A1515", // Rich Espresso background
          charcoal: "#241E1E", // Cocoa Charcoal
          card: "#302828", // Lighter warm cocoa brown for card components
          green: "#9D73E6", // Accent Warm Purple / Violet
          glow: "rgba(157, 115, 230, 0.4)", // Purple Glow
          gray: "#3E3333", // Warm Gray-Brown for hover states
          border: "#4A3C3C", // Soft Brown Border
          textMuted: "#CFC2C2", // Muted Warm Oatmeal Beige text
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
