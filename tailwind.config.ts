import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // Base surface palette sampled from the Night's Watch crest —
        // cold charcoal-blue "beyond the Wall" tones.
        bg: {
          DEFAULT: "#090c11",
          soft: "#0f141b",
          card: "#141b23",
          border: "#242f3a"
        },
        // Blood Strike's signature red — used as the sole "hot" accent
        // against the cold Night's Watch palette (torchlight against ice).
        brand: {
          DEFAULT: "#dc2635",
          hover: "#b91c2a",
          muted: "#5c141d"
        },
        // Pale moonlight / weathered-steel accents from the crest engraving
        accent: {
          DEFAULT: "#d4af6a",
          cyan: "#8ec6e0"
        },
        // Icy whites for headings/highlights, taken directly from the frost
        // tones on the crest
        ice: {
          DEFAULT: "#cddfe9",
          soft: "#eaf2f6",
          dim: "#8ea3b0"
        },
        // Cold steel greys for secondary surfaces / dividers
        steel: {
          DEFAULT: "#1e2b33",
          soft: "#2c3c47"
        },
        // Weathered wood/bronze from the crest's ribbon banner — used
        // sparingly for dividers and rank flourishes
        bronze: {
          DEFAULT: "#655d51",
          soft: "#403e3a"
        },
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#dc2635",
        muted: "#93a3ac"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Cinzel'", "'Rajdhani'", "Inter", "system-ui", "serif"]
      },
      boxShadow: {
        glow: "0 0 22px rgba(220,38,53,0.3)",
        "glow-ice": "0 0 22px rgba(142,198,224,0.22)",
        card: "0 4px 20px rgba(0,0,0,0.45)",
        // Neomorphic "soft UI" shadows — dual light/dark casts off the
        // dark charcoal surface, evoking metal embossed on stone.
        neo: "9px 9px 20px rgba(0,0,0,0.55), -7px -7px 16px rgba(205,223,233,0.03)",
        "neo-sm": "5px 5px 12px rgba(0,0,0,0.5), -4px -4px 10px rgba(205,223,233,0.025)",
        "neo-inset": "inset 4px 4px 10px rgba(0,0,0,0.6), inset -3px -3px 8px rgba(205,223,233,0.025)",
        "neo-inset-sm": "inset 2px 2px 6px rgba(0,0,0,0.55), inset -2px -2px 5px rgba(205,223,233,0.02)"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 0 rgba(220,38,53,0)" },
          "50%": { boxShadow: "0 0 24px rgba(220,38,53,0.45)" }
        }
      },
      animation: {
        fadeIn: "fadeIn .4s ease-out",
        pulseGlow: "pulseGlow 2.2s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
