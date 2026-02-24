import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
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
