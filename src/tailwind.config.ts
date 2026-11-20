const config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,md,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,md,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,md,mdx}",
	  ],
	  theme: {
		extend: {
		  colors: {
			// Primary
			'olive': '#716D3D',
			'olive-dark': '#56522D',
			'olive-bright': '#B9B17B',
			'gold': '#906820',
			'gold-dark': '#725016',
			'gold-bright': '#D6B75C',
			'night': '#1E1F18',
			'night-border': '#65644E',
			'white': '#FFFFFF',
			'black': '#27271E',
			'ivory-black': '#27271E',
			'ivory-black-lighter': '#3D3D30',
			'ivory': '#FFFFFF',
			// Supporting palette
			'laurel': '#536347',
			'laurel-light': '#6B8260',
			'stone': '#938D77',
			'stone-light': '#B9B29B',
			'stone-dark': '#68634F',
			'bronze': '#80633E',
			'bronze-light': '#A69066',
			'parchment': '#F7F8F4',
			'parchment-dark': '#EEF0E9',
		  },
		  backgroundImage: {
			'atom-magic-circle-white': "url('/atom-magic-circle-white.png')",
			'atom-magic-circle-black': "url('/atom-magic-circle-black.png')",
			"olive-gradient": "linear-gradient(135deg, #56522D 0%, #716D3D 100%)",
			"standard-gradient": "linear-gradient(135deg, #56522D 0%, #716D3D 100%)",
			"sunset-gradient": "linear-gradient(135deg, #56522D 0%, #716D3D 100%)",
			"parchment-gradient": "linear-gradient(180deg, #F7F8F4 0%, #EEF0E9 100%)",
			"classical-gradient": "linear-gradient(135deg, #906820 0%, #80633E 50%, #716D3D 100%)",
			"stone-gradient": "linear-gradient(180deg, #B9B29B 0%, #938D77 50%, #68634F 100%)",
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
		  'night': '#1E1F18',
		  'night-border': '#65644E',
		  'white': '#FFFFFF',
		  'black': '#27271E',
		  'olive': '#716D3D',
		  'olive-dark': '#56522D',
		  'olive-bright': '#B9B17B',
		  'gold': '#906820',
		  'gold-dark': '#725016',
		  'gold-bright': '#D6B75C',
		  'ivory-black': '#27271E',
		  'ivory-black-lighter': '#3D3D30',
		  'ivory': '#FFFFFF',
		  // Supporting palette
		  'laurel': '#536347',
		  'laurel-light': '#6B8260',
		  'stone': '#938D77',
		  'stone-light': '#B9B29B',
		  'stone-dark': '#68634F',
		  'bronze': '#80633E',
		  'bronze-light': '#A69066',
		  'parchment': '#F7F8F4',
		  'parchment-dark': '#EEF0E9',
		},
	  },
	  darkMode: "class",
  plugins: [],
};
export default config;
