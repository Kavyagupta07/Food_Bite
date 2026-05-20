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
          black: "#0A0A0A",
          charcoal: "#121212",
          card: "#1A1A1A",
          green: "#39FF14", // Neon Green
          glow: "rgba(57, 255, 20, 0.4)",
          gray: "#2A2A2A",
          border: "#333333",
          textMuted: "#A0A0A0",
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
