
import type { Config } from "tailwindcss";
//import {nextui} from "@nextui-org/react";
const {heroui} = require("@heroui/react");

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
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
        'goldenrod': '#daa520',
        'sunset-blue': 'rgb(0, 179, 164)',
        'sunset-red': 'rgb(238, 100, 58)'
      },
      backgroundImage: {
        'atom-magic-circle-white': "url('/atom-magic-circle-white.png')",
        'atom-magic-circle-black': "url('/atom-magic-circle-black.png')",
        "standard-gradient": "linear-gradient(85deg, rgb(211, 142, 39) 0%, rgb(208, 145, 37) 11%, rgb(205, 151, 35) 23%, rgb(202, 154, 33) 34%, rgb(197, 159, 32) 46%, rgb(192, 160, 33) 57%, rgb(186, 163, 33) 68%, rgb(180, 165, 34) 79%, rgb(177, 170, 37) 90%, rgb(171, 174, 41) 100%)",
        "sunset-gradient": "linear-gradient(195deg, rgb(0, 179, 164) 0%, rgb(66, 184, 145) 10%, rgb(104, 187, 123) 20%, rgb(141, 189, 107) 30%, rgb(175, 187, 93) 40%, rgb(208, 184, 88) 50%, rgb(215, 169, 71) 60%, rgb(221, 154, 60) 70%, rgb(227, 137, 53) 80%, rgb(234, 119, 52) 90%, rgb(238, 100, 58) 100%)",
      },
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontFamily: 'var(--font-marcellus)',
            },
            h2: {
              fontFamily: 'var(--font-marcellus)',
            },
            h3: {
              fontFamily: 'var(--font-marcellus)',
            },
            h4: {
              fontFamily: 'var(--font-marcellus)',
            },
            h5: {
              fontFamily: 'var(--font-marcellus)',
            },
            h6: {
              fontFamily: 'var(--font-marcellus)',
            },
          },
        }
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
    // heroui({
    //   layout: {
    //     hoverOpacity: 0
    //   },
    //   themes: {
    //     light: {
    //       colors: {
    //         default: {
    //           100: "rgba(35, 31, 32, .1)",
    //           200: "rgba(35, 31, 32, .2)",
    //           300: "rgba(35, 31, 32, .3)",
    //           400: "rgba(35, 31, 32, .4)"
    //         },
    //       }
    //     },
    //   },
    // }),
    // require('@tailwindcss/typography')
  ],
};
export default config;
