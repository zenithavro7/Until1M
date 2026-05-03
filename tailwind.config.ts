import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0014",
        neon: "#c4ff00",
        electric: "#7c3aed",
        cyan2: "#22d3ee",
        magenta: "#ff2bd6",
      },
      fontFamily: {
        display: ["ui-sans-serif", "system-ui", "Inter", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(196,255,0,0.35), 0 0 12px rgba(124,58,237,0.6)",
      },
      animation: {
        pulseGlow: "pulseGlow 2.6s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        gradient: "gradient 12s ease infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%,100%": { filter: "drop-shadow(0 0 10px #c4ff00)" },
          "50%": { filter: "drop-shadow(0 0 28px #ff2bd6)" },
        },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        gradient: {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
