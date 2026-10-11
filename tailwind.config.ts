import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        chip:    "#05070d",
        copper:  "#F2A33A",
        cyan:    "#2FE6FF",
        lime:    "#7CFF6B",
        amber:   "#FFB020",
        coral:   "#FF5C6C",
        "off-white": "#E8ECF4",
        muted:   "#8A93A6",
        panel:   "rgba(255,255,255,0.04)",
        border:  "rgba(255,255,255,0.10)",
      },
      fontFamily: {
        heading: ["Space Grotesk", "Sora", "sans-serif"],
        body:    ["Inter", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "signal-travel": "signal-travel 3s linear infinite",
        "count-up": "count-up 1s ease-out forwards",
        "silicon-drift": "silicon-drift 40s linear infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px 2px rgba(242,163,58,0.4)" },
          "50%":       { boxShadow: "0 0 20px 6px rgba(242,163,58,0.8)" },
        },
        "signal-travel": {
          "0%":   { strokeDashoffset: "200" },
          "100%": { strokeDashoffset: "0" },
        },
        "silicon-drift": {
          "0%":   { transform: "translate(0,0)" },
          "100%": { transform: "translate(-80px,-80px)" },
        },
      },
      backdropBlur: {
        glass: "12px",
      },
    },
  },
  plugins: [],
};
export default config;
