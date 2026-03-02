/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Core brand tokens (spec §2.1)
        primary:   "#1A1A18",   // Dark charcoal
        secondary: "#7C6FCD",   // Purple/lavender
        accent:    "#CADB00",   // Lime — hero brand color

        // Extended palette
        lime:    { DEFAULT: "#CADB00", 400: "#DBE200", 500: "#CADB00" },
        navy:    { DEFAULT: "#0E1829", 800: "#0E2038", 900: "#0E1829" },
        cream:   { DEFAULT: "#F7EEE7", 100: "#F7EEE7", 200: "#E8DDD3" },
        lavender:"#A195F9",
        mauve:   "#7A5973",
        purple:  "#7C6FCD",
        rose:    "#D95F78",
        orange:  "#E07A3A",
        amber:   { DEFAULT: "#F5A524", warn: "#92400E" },
      },
      fontFamily: {
        sans:  ["DM Sans", "system-ui", "-apple-system", "sans-serif"],
        serif: ["DM Serif Display", "serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        glass: "0 2px 8px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.05)",
        hero:  "0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
}
