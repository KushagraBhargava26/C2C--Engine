/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0D1117",
          soft: "#141B24",
          raised: "#1B2430",
        },
        steel: {
          DEFAULT: "#2A3542",
          light: "#3A4757",
        },
        parchment: {
          DEFAULT: "#E7E4DA",
          dim: "#9AA3AE",
          faint: "#6B7684",
        },
        bullion: {
          DEFAULT: "#C9A227",
          bright: "#E0BC4A",
          dim: "#8A6E1C",
        },
        risk: {
          low: "#3D7A6E",
          medium: "#C98A3A",
          high: "#C1562E",
          critical: "#A8324B",
        },
        signal: {
          a: "#34D399",
          b: "#22B8CF",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};