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
        'ivory-black': '#231F20',
        'ivory-black-lighter': '#3E3A36',
        'ivory': '#fffff0',
        'pale-blue': '#ADE4E4',
        'adobe': '#bd6c48',
        'olive-green': '#BAB86C',
        'dark-olive-green': '#8A8841',
        'goldenrod': '#daa520'
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
      'ivory-black': '#231F20',
      'ivory-black-lighter': '#3E3A36',
      'ivory': '#fffff0',
      'pale-blue': '#ADE4E4',
      'adobe': '#bd6c48',
      'olive-green': '#BAB86C',
      'dark-olive-green': '#8A8841',
      'goldenrod': '#daa520'
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};
export default config;
