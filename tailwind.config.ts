import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./client/src/**/*.{js,ts,jsx,tsx,html}"
  ],
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
      }
    }
  },
  plugins: []
}

export default config
