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
        "gold": 'rgb(187, 151, 49)',
        'brightgold': 'rgb(226, 185, 68)',
        'white': 'rgb(255, 255, 240)',
        'black': 'rgb(35, 31, 32)',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
    container: {
      center: true,
      padding: '6rem',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'white': 'rgb(255, 255, 240)',
      'black': 'rgb(35, 31, 32)',
      'gold': 'rgb(187, 151, 49)',
      'brightgold': 'rgb(226, 185, 68)',
      'tahiti': '#3ab7bf',
      'silver': '#ecebff',
      'bubble-gum': '#ff77e9',
      'bermuda': '#78dcca',
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};
export default config;
