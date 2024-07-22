import { mdiBookshelf, mdiScriptText, mdiHeadCog, mdiAtom } from '@mdi/js';

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
		icon: mdiBookshelf,
		description: "Educated by the masters from the Academia Theurgiae Atomi, their rigorous and highly structured education system has shaped you into one of the premier atom mages of Solum.",
	},
	{
		name: "Iconoclast",
		value: "iconoclast",
		latin: "Discipulīna Audax",
		icon: mdiScriptText,
		description: "Schooled by heretical atom mages who shun the restraint and erudite style of the Academia Theurgiae Atomi, you have learned forbidden techniques and must evade the eyes of the Academy.",
	},
	{
		name: "Autodidact",
		value: "autodidact",
		latin: "Erudītio Sui",
		icon: mdiHeadCog,
		description: "A wild prodigy, you have learned everything you know through grit, determination, and trial and error. The Academy may turn its nose up at you, but they will still employ you none the less.",
	},
];

export const CARDINALS = [
	{
		name: "Anathema",
		value: "anathema",
		svgSrc: "/sigils/Anathema.svg",
		latin: "ANATHEMUM",
		epithet: "The Hammer of Umos",
		epithetLatin: "Malleus Umi",
		description: "Tyranny, Oppression, Domination, and Control.",
		icon: "",
		effects: [
			{
				key: "1",
				name: "Iron Fist",
				latin: "PUGNUS FERREUS",
				icon: "mdiAnvil",
				description: "Your callous nature makes it easy for you to ignore the concerns of others.",
				levels: {
					i: "+10% of chance of compelling others to do your will.",
					ii: "+15% of chance of compelling others to do your will.",
					iii: "+20% of chance of compelling others to do your will.",
				}
			},
			{
				key: "2",
				name: "Bad Reputation",
				latin: "FAMA MALA",
				icon: "mdiBullhorn",
				description: "Word of your nature has built infamy around your name.",
				levels: {
					i: "-%10 to reputation.",
					ii: "-%15 to reputation.",
					iii: "-%20 to reputation.",
				}
			}
		]
	},
	{
		name: "Aura",
		value: "aura",
		svgSrc: "/sigils/Aura.svg",
		latin: "AURA",
		epithet: "The Eternal Shadow of Umos",
		epithetLatin: "Umbra Aeterna Umi",
		description: "Matter, Anti-matter, Energy, and Atom Magic.",
		icon: "",
		effects: [
			{
				key: "1",
				name: "Man is Matter",
				latin: "HOMO MATERIA EST",
				icon: "mdiAtom",
				description: "Matter and anti-matter are especially receptive to your will.",
				levels: {
					i: "+10% to atom magic techniques.",
					ii: "+15% to atom magic techniques.",
					iii: "+20% to atom magic techniques.",
				}
			},
			{
				key: "2",
				name: "Explosive Touch",
				latin: "CONTAGIO DISPLOSA",
				icon: "mdiFire",
				description: "Your heightened atomic powers sometimes cause unexpected things to happen with physical contact.",
				levels: {
					i: "%10 chance of object spontaneously combusting when touched.",
					ii: "%15 chance of object spontaneously combusting when touched.",
					iii: "%20 chance of object spontaneously combusting when touched.",
				}
			}
		]
	},
	{
		name: "Arcadia",
		value: "arcadia",
		svgSrc: "/sigils/Arcadia.svg",
		latin: "AMOROS",
		epithet: "The Sower of Life",
		epithetLatin: "Sator Vitae",
		description: "Growth, Fertility, and New Beginnings.",
		icon: "",
		effects: [
			{
				key: "1",
				name: "Reset",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: {
					i: "+10% to atom magic techniques.",
					ii: "+15% to atom magic techniques.",
					iii: "+20% to atom magic techniques.",
				}
			},
			{
				key: "2",
				name: "Overgrown",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: {
					i: "%10 chance of object spontaneously combusting when touched.",
					ii: "%15 chance of object spontaneously combusting when touched.",
					iii: "%20 chance of object spontaneously combusting when touched.",
				}
			}
		]
	},
	{
		name: "Cadence",
		value: "cadence",
		svgSrc: "/sigils/Cadence.svg",
		latin: "METRONUM",
		epithet: "The Steward of Time",
		epithetLatin: "Prōcūrātor Temporis",
		description: "Time and measurement.",
		icon: "",
		effects: [
			{
				key: "1",
				name: "Like Clockwork",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: {
					i: "+10%",
					ii: "+15%",
					iii: "+20%",
				}
			},
			{
				key: "2",
				name: "Losing Track of Time",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: {
					i: "%10",
					ii: "%15",
					iii: "%20",
				}
			}
		]
	},
	{
		name: "Charlatan",
		value: "charlatan",
		svgSrc: "/sigils/Charlatan.svg",
		latin: "OBSCUROS",
		epithet: "The Master of Lies",
		epithetLatin: "Dominus Mendāciorum",
		description: "Trickery, Manipulation, Deception, and Cheating.",
		icon: "",
		effects: [
			{
				key: "1",
				name: "Master Manipulator",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: {
					i: "+10%",
					ii: "+15%",
					iii: "+20%",
				}
			},
			{
				key: "2",
				name: "Untrustworthy",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: {
					i: "%10",
					ii: "%15",
					iii: "%20",
				}
			}
		]
	},
	{
		name: "Gamma",
		value: "gamma",
		svgSrc: "/sigils/Gamma.svg",
		latin: "PERDITOR",
		epithet: "The Savage Destroyer",
		epithetLatin: "Ātrox Deletor",
		description: "Death, Destruction, and Decay.",
		icon: "",
		effects: [
			{
				key: "1",
				name: "",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: {
					i: "+10%",
					ii: "+15%",
					iii: "+20%",
				}
			},
			{
				key: "2",
				name: "Half-life",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: {
					i: "%10",
					ii: "%15",
					iii: "%20",
				}
			}
		]
	},
	{
		name: "Magna",
		value: "magna",
		svgSrc: "/sigils/Magna.svg",
		latin: "LEXINUM",
		epithet: "The Prime Ambassador",
		epithetLatin: "Lēgātus Primus",
		description: "Accords, Deals, Laws, and Compacts.",
		icon: "",
		effects: [
			{
				key: "1",
				name: "",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: {
					i: "+10%",
					ii: "+15%",
					iii: "+20%",
				}
			},
			{
				key: "2",
				name: "Half-life",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: {
					i: "%10",
					ii: "%15",
					iii: "%20",
				}
			}
		]
	},
	{
		name: "Mnemonic",
		value: "mnemonic",
		svgSrc: "c/sigils/Mnemonic.svg",
		latin: "TABULARUM",
		epithet: "The Memory of Umos",
		epithetLatin: "Memoria Umi",
		description: "Knowledge and Memory.",
		icon: "",
		effects: [
			{
				key: "1",
				name: "",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: {
					i: "+10%",
					ii: "+15%",
					iii: "+20%",
				}
			},
			{
				key: "2",
				name: "Half-life",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: {
					i: "%10",
					ii: "%15",
					iii: "%20",
				}
			}
		]
	},
	{
		name: "Polyphony",
		value: "polyphony",
		svgSrc: "/sigils/Polyphony.svg",
		latin: "CANTOS",
		epithet: "The Chief Artist",
		epithetLatin: "Artifex Primus",
		description: "Music, Arts, Writing, Speech, and Wisdom.",
		icon: "",
		effects: [
			{
				key: "1",
				name: "",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: {
					i: "+10%",
					ii: "+15%",
					iii: "+20%",
				}
			},
			{
				key: "2",
				name: "Half-life",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: {
					i: "%10",
					ii: "%15",
					iii: "%20",
				}
			}
		]
	},
	{
		name: "Rubicon",
		value: "rubicon",
		svgSrc: "/sigils/Rubicon.svg",
		latin: "FATIOS",
		epithet: "The Terror of Kings",
		epithetLatin: "Formīdo Regum",
		description: "Independence, Revolution, Resistance, and Usurpation.",
		icon: "",
		effects: [
			{
				key: "1",
				name: "",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: {
					i: "+10%",
					ii: "+15%",
					iii: "+20%",
				}
			},
			{
				key: "2",
				name: "Half-life",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: {
					i: "%10",
					ii: "%15",
					iii: "%20",
				}
			}
		]
	},
	{
		name: "Sovereign",
		value: "sovereign",
		svgSrc: "/sigils/Sovereign.svg",
		latin: "ORDINATUM",
		epithet: "The Power of the State",
		epithetLatin: "Potestas Imperii",
		description: "Hierarchy, Government, Monarchy, and Structure.",
		icon: "",
		effects: [
			{
				key: "1",
				name: "",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: {
					i: "+10%",
					ii: "+15%",
					iii: "+20%",
				}
			},
			{
				key: "2",
				name: "Half-life",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: {
					i: "%10",
					ii: "%15",
					iii: "%20",
				}
			}
		]
	},
	{
		name: "Spectrum",
		value: "spectrum",
		svgSrc: "/sigils/Spectrum.svg",
		latin: "SPECTROS",
		epithet: "The Heart of Solum",
		epithetLatin: "Pectus Soli",
		description: "Love, Hate, and Emotions.",
		icon: "",
		effects: [
			{
				key: "1",
				name: "",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: {
					i: "+10%",
					ii: "+15%",
					iii: "+20%",
				}
			},
			{
				key: "2",
				name: "Half-life",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: {
					i: "%10",
					ii: "%15",
					iii: "%20",
				}
			}
		]
	},
	{
		name: "Vertigo",
		value: "vertigo",
		svgSrc: "/sigils/Vertigo.svg",
		latin: "ARCOS",
		epithet: "The Voice of Discord",
		epithetLatin: "Vox Discordii",
		description: "Madness, Chaos, Confusion, and Randomness.",
		icon: "",
		effects: [
			{
				key: "1",
				name: "",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: {
					i: "+10%",
					ii: "+15%",
					iii: "+20%",
				}
			},
			{
				key: "2",
				name: "Half-life",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: {
					i: "%10",
					ii: "%15",
					iii: "%20",
				}
			}
		]
	}
];