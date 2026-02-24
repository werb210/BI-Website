import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx,html}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#020C1C",
          bgAlt: "#071A2F",
          surface: "#0E2239",
          accent: "#F2994A",
          accentHover: "#E8892F"
        }
      },
      borderColor: {
        subtle: "rgba(255,255,255,0.05)",
        card: "rgba(255,255,255,0.1)"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: []
}

export default config
