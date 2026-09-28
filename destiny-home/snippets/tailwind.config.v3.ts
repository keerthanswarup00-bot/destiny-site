// Only needed if your repo is on Tailwind v3 (check package.json: "tailwindcss": "^3...").
// Merge into your existing tailwind.config.ts under theme.extend
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0B0C",
        bg2: "#141416",
        paper: "#F3F1EC",
        gold: "#C9A15A",
        mute: "#9C9A96",
        line: "rgba(243,241,236,0.12)",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
    },
  },
} satisfies Config;
