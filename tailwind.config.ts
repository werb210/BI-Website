import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // BI_WEBSITE_BLOCK_v83_BODY_PALETTE_PARITY_v1 — exact BF-Website
        // palette so BI body pages match "1 for 1 colours, look feel".
        bf: {
          bg: "#020817",          // page background
          surface: "#08132a",     // card background
          surfaceAlt: "#0d1b39",  // hover card
          footer: "#071a2f",      // footer
          cta: "#2563eb",         // primary CTA blue
          ctaHover: "#1d4ed8",    // primary CTA hover
          textMuted: "rgb(203 213 225)",  // slate-300
        },
        brand: {
          bg: "rgb(2 12 28)",
          bgAlt: "rgb(7 26 47)",
          surface: "rgb(14 34 57)",
          accent: "rgb(242 153 74)",
          accentHover: "rgb(232 137 47)",
        },
      },
      borderColor: {
        subtle: "rgba(255,255,255,0.05)",
        card: "rgba(255,255,255,0.1)",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
