import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
      },
      colors: {
        green: { DEFAULT: "#7dc443", light: "#c8f08f" },
        blue:  { DEFAULT: "#4fa3e0", light: "#a8d8f0" },
      },
    },
  },
  plugins: [],
};

export default config;
