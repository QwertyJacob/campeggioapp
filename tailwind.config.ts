import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        camp: {
          green: "#2d6a4f",
          light: "#74c69d",
          bg: "#d8f3dc",
          accent: "#1b4332",
          warm: "#f77f00",
        },
      },
    },
  },
  plugins: [],
};

export default config;
