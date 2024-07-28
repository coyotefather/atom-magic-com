
import type { Config } from "tailwindcss";
import {nextui} from "@nextui-org/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
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
        'atom-magic-circle-white': "url('/atom-magic-circle-white.png')",
        'atom-magic-circle-black': "url('/atom-magic-circle-black.png')",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "standard-gradient": "linear-gradient(85deg, rgb(211, 142, 39) 0%, rgb(208, 145, 37) 11%, rgb(205, 151, 35) 23%, rgb(202, 154, 33) 34%, rgb(197, 159, 32) 46%, rgb(192, 160, 33) 57%, rgb(186, 163, 33) 68%, rgb(180, 165, 34) 79%, rgb(177, 170, 37) 90%, rgb(171, 174, 41) 100%)",
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
  darkMode: "class",
  plugins: [
    nextui(),
  ],
};
export default config;
