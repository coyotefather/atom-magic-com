export const NAVIGATION_LINKS = [
	{ href: "https://atom-magic.com/codex", name: "CODEX", icon: "", extended: false },
	{ href: "/character", name: "CHARACTER MANAGER", icon: "", extended: true },
	{ href: "/vorago", name: "VORAGO", icon: "", extended: true },
	{ href: "/tools", name: "TOOLS", icon: "", extended: false }
];

export const STATS = {
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
}