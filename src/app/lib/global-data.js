export const NAVIGATION_LINKS = [
	{ href: "https://atom-magic.com/codex", name: "CODEX", icon: "", extended: false },
	{ href: "/character", name: "CHARACTER MANAGER", icon: "", extended: true },
	{ href: "/vorago", name: "VORAGO", icon: "", extended: true },
	{ href: "/tools", name: "TOOLS", icon: "", extended: false }
];

export const CULTURES = [
	{ name: "Spiranos", value: "spiranos" },
	{ name: "Boreanos", value: "boreanos" },
	{ name: "Feranos", value: "Feranos" },
	{ name: "Umbra", value: "Umbra" },
	{ name: "Autogena", value: "Autogena" },
];

export const SCORES = {
	physical: {
		name: "Physical",
		children: [
			{ name: "Agility", value: "agility" },
			{ name: "Speed", value: "speed" },
			{ name: "Reflex", value: "reflex" },
			{ name: "Endurance", value: "endurance" },
		],
		elective: {
			name: "Energy",
			value: "energy"
		},
	},
	interpersonal: {
		name: "Interpersonal",
		children: [
			{ name: "Percieved Attractiveness", value: "percievedAttractiveness" },
			{ name: "Charm", value: "charm" },
			{ name: "Speech", value: "speech" },
			{ name: "Empathy", value: "empathy" },
		],
		elective: {
			name: "Personality",
			value: "personality"
		},
	},
	intellect: {
		name: "Intellect",
		children: [
			{ name: "Knowledge", value: "knowledge" },
			{ name: "Critical Thinking", value: "criticalThinking" },
			{ name: "Analysis", value: "analysis" },
			{ name: "Judgement", value: "judgement" },
		],
		elective: {
			name: "IQ",
			value: "iq"
		},
	},
	psyche: {
		name: "psyche",
		children: [
			{ name: "Mental Stability", value: "mentalStability" },
			{ name: "Emotional Stability", value: "emotionalStability" },
			{ name: "Focus And Concentration", value: "focusAndConcentration" },
			{ name: "Courage And Conviction", value: "courageAndConviction" },
		],
		elective: {
			name: "Faith",
			value: "faith"
		},
	},
};

export const PATHS = [
	{
		name: "Theurgist",
		value: "theurgist",
		latin: "Doctrina Acadēmia",
		icon: "mdiBookshelf",
		description: "Educated by the masters from the Academia Theurgiae Atomi, their rigorous and highly structured education system has shaped you into one of the premier atom mages of Solum.",
	},
	{
		name: "Iconoclast",
		value: "iconoclast",
		latin: "Discipulīna Audax",
		icon: "mdiScriptText",
		description: "Schooled by heretical atom mages who shun the restraint and erudite style of the Academia Theurgiae Atomi, you have learned forbidden techniques and must evade the eyes of the Academy.",
	},
	{
		name: "Autodidact",
		value: "autodidact",
		latin: "Erudītio Sui",
		icon: "mdiHeadCog",
		description: "A wild prodigy, you have learned everything you know through grit, determination, and trial and error. The Academy may turn its nose up at you, but they will still employ you none the less.",
	},
];