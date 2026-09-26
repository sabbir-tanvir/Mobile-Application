/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        turf: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        surface: {
          light: "#ffffff",
          "light-subtle": "#f8fafc",
          "light-border": "#e2e8f0",
          dark: "#09090b",
          "dark-card": "#18181b",
          "dark-border": "#27272a",
          card: "#18181b",
          border: "#27272a",
          muted: "#71717a",
        },
      },
      boxShadow: {
        soft: "0 2px 10px rgba(0, 0, 0, 0.05)",
        medium: "0 4px 20px rgba(0, 0, 0, 0.08)",
        glow: "0 0 20px rgba(34, 197, 94, 0.25)",
      },
    },
  },
  plugins: [],
};
