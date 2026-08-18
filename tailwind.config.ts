import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // BI_WEBSITE_DESIGN_v101 - the marketing site's faces.
      fontFamily: {
        display: ["'Libre Caslon Text'", "Georgia", "serif"],
        sans: ["'Public Sans'", "system-ui", "sans-serif"],
      },
      colors: {
        // BI_WEBSITE_BLOCK_v83_BODY_PALETTE_PARITY_v1 — exact BF-Website
        // palette so BI body pages match "1 for 1 colours, look feel".
        // BI_WEBSITE_DESIGN_v101 - the CURRENT BF-Website palette. The previous
        // values mirrored the pre-rebuild dark theme and are gone from the
        // marketing site entirely.
        bf: {
          bg: "#081729",          // page background - boreal ink, deep
          surface: "#0B1F3A",     // card background - boreal ink
          surfaceAlt: "#0d233f",  // hover card
          footer: "#0a1120",      // footer, matching the shared template
          cta: "#BF9B49",         // primary CTA - boreal gold
          ctaHover: "#cfa953",    // primary CTA hover
          ink: "#0B1F3A",         // navy, for use on light surfaces
          mist: "#F5F8FC",        // light surface
          line: "#E4EAF2",        // hairline on light surfaces
          body: "#51617D",        // body copy on light surfaces
          textMuted: "#c3cfe0",   // muted copy on dark surfaces
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
