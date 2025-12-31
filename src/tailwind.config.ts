const {heroui} = require("@heroui/react");

const config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,md,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,md,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,md,mdx}",
		"./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
	  ],
	  theme: {
		extend: {
		  colors: {
			// Primary
			"gold": 'rgb(187, 151, 49)',
			'brightgold': 'rgb(226, 185, 68)',
			'white': 'rgb(255, 255, 240)',
			'black': 'rgb(35, 31, 32)',
			'ivory-black': '#231F20',
			'ivory-black-lighter': '#3E3A36',
			'ivory': '#fffff0',
			// Classical palette
			'oxblood': '#722F37',
			'oxblood-light': '#8B3A42',
			'laurel': '#5A6F4E',
			'laurel-light': '#6B8260',
			'stone': '#9A9A8E',
			'stone-light': '#B5B5A8',
			'stone-dark': '#6B6B62',
			'bronze': '#8C7853',
			'bronze-light': '#A69066',
			'parchment': '#F5F0E1',
			'parchment-dark': '#E8E0CC',
		  },
		  backgroundImage: {
			'atom-magic-circle-white': "url('/atom-magic-circle-white.png')",
			'atom-magic-circle-black': "url('/atom-magic-circle-black.png')",
			"gold-gradient": "linear-gradient(135deg, #BB9731 0%, #D4AF37 50%, #E2B944 100%)",
			"standard-gradient": "linear-gradient(135deg, #BB9731 0%, #D4AF37 50%, #E2B944 100%)",
			"sunset-gradient": "linear-gradient(135deg, #BB9731 0%, #D4AF37 50%, #E2B944 100%)",
			"parchment-gradient": "linear-gradient(180deg, #F5F0E1 0%, #E8E0CC 100%)",
			"classical-gradient": "linear-gradient(135deg, #722F37 0%, #8C7853 50%, #BB9731 100%)",
			"stone-gradient": "linear-gradient(180deg, #B5B5A8 0%, #9A9A8E 50%, #6B6B62 100%)",
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
		  // Primary
		  'white': 'rgb(255, 255, 240)',
		  'black': 'rgb(35, 31, 32)',
		  'gold': 'rgb(187, 151, 49)',
		  'brightgold': 'rgb(226, 185, 68)',
		  'ivory-black': '#231F20',
		  'ivory-black-lighter': '#3E3A36',
		  'ivory': '#fffff0',
		  // Classical palette
		  'oxblood': '#722F37',
		  'oxblood-light': '#8B3A42',
		  'laurel': '#5A6F4E',
		  'laurel-light': '#6B8260',
		  'stone': '#9A9A8E',
		  'stone-light': '#B5B5A8',
		  'stone-dark': '#6B6B62',
		  'bronze': '#8C7853',
		  'bronze-light': '#A69066',
		  'parchment': '#F5F0E1',
		  'parchment-dark': '#E8E0CC',
		},
	  },
	  darkMode: "class",
  plugins: [heroui()],
};
export default config;
