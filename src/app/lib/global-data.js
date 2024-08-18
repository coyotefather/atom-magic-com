import { mdiBookshelf, mdiScriptText, mdiHeadCog, mdiAtom } from '@mdi/js';

export const NAVIGATION_LINKS = [
	{ href: "/codex", name: "CODEX", icon: "", extended: false },
	{ href: "/character", name: "CHARACTER MANAGER", icon: "", extended: false },
	{ href: "/vorago", name: "VORAGO", icon: "", extended: false },
	{ href: "/contact", name: "CONTACT", icon: "", extended: true }
];

export const CULTURES = [
	{
		name: "Spiranos",
		value: "spiranos",
		description: "Phasellus porta vulputate dolor quis commodo. Morbi ut mauris risus. Vivamus tempus sollicitudin nisl, ac cursus dolor posuere vel.",
		aspects: [
			{
				name: "Lorem Ispum",
				value: "loremIspum",
				page: "Lorem_Ispum",
				description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus rhoncus est nec lectus auctor ultricies. In id tellus semper, luctus nisi eget, hendrerit nisi. Nullam in nisl vehicula, ultricies magna id, posuere ex."
			},
			{
				name: "Aenean Commodo",
				value: "aeneanCommodo",
				page: "Aenean_Commodo",
				description: "Donec ullamcorper nisl lectus, eget rhoncus tortor accumsan sit amet. Sed justo est, dignissim accumsan nisl eu, mattis efficitur dui. Ut sit amet varius felis, non efficitur eros. "
			},
		]
	},
	{
		name: "Boreanos",
		value: "boreanos",
		description: "Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aenean commodo mauris nec lobortis luctus.",
		aspects: [
			{
				name: "Ultrices Quis",
				value: "ultricesQuis",
				page: "Ultrices_Quis",
				description: "Praesent dui nunc, ultrices quis quam in, luctus luctus ipsum. Aenean vel mauris congue, ornare purus ut, convallis turpis."
			},
			{
				name: "Aenean Commodo",
				value: "aeneanCommodo",
				page: "Aenean_Commodo",
				description: "Donec ullamcorper nisl lectus, eget rhoncus tortor accumsan sit amet. Sed justo est, dignissim accumsan nisl eu, mattis efficitur dui. Ut sit amet varius felis, non efficitur eros. "
			},
		]
	},
	{
		name: "Feranos",
		value: "Feranos",
		description: "Vivamus nisi diam, varius imperdiet mi at, sagittis imperdiet tortor. Donec nec massa eget neque rhoncus blandit.",
		aspects: [
			{
				name: "Aenean Condimentum",
				value: "aeneanCondimentum",
				page: "Aenean_Condimentum",
				description: "Aenean condimentum in diam rhoncus imperdiet. Sed magna lorem, malesuada sed elit at, tristique porta enim. Nam semper orci arcu, eu pharetra dui porttitor non."
			},
			{
				name: "Aenean Commodo",
				value: "aeneanCommodo",
				page: "Aenean_Commodo",
				description: "Donec ullamcorper nisl lectus, eget rhoncus tortor accumsan sit amet. Sed justo est, dignissim accumsan nisl eu, mattis efficitur dui. Ut sit amet varius felis, non efficitur eros. "
			},
		]
	},
	{
		name: "Umbra",
		value: "Umbra",
		description: "Quisque id ipsum vulputate, volutpat ipsum ac, vehicula orci. Curabitur fringilla pulvinar eros sed mattis. Sed vitae tortor eu risus laoreet convallis.",
		aspects: [
			{
				name: "Lorem Ispum",
				value: "loremIspum",
				page: "Lorem_Ispum",
				description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus rhoncus est nec lectus auctor ultricies. In id tellus semper, luctus nisi eget, hendrerit nisi. Nullam in nisl vehicula, ultricies magna id, posuere ex."
			},
			{
				name: "Aenean Commodo",
				value: "aeneanCommodo",
				page: "Aenean_Commodo",
				description: "Donec ullamcorper nisl lectus, eget rhoncus tortor accumsan sit amet. Sed justo est, dignissim accumsan nisl eu, mattis efficitur dui. Ut sit amet varius felis, non efficitur eros. "
			},
		]
	},
	{
		name: "Autogena",
		value: "Autogena",
		description: "Curabitur semper metus et lacus tempor accumsan. Cras eget justo eu nisi ultricies venenatis quis imperdiet purus.",
		aspects: [
			{
				name: "Lorem Ispum",
				value: "loremIspum",
				page: "Lorem_Ispum",
				description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus rhoncus est nec lectus auctor ultricies. In id tellus semper, luctus nisi eget, hendrerit nisi. Nullam in nisl vehicula, ultricies magna id, posuere ex."
			},
			{
				name: "Aenean Commodo",
				value: "aeneanCommodo",
				page: "Aenean_Commodo",
				description: "Donec ullamcorper nisl lectus, eget rhoncus tortor accumsan sit amet. Sed justo est, dignissim accumsan nisl eu, mattis efficitur dui. Ut sit amet varius felis, non efficitur eros. "
			},
		]
	},
];

export const SCORES = {
	physical: {
		name: "Physical",
		children: [
			{ name: "Agility", id: "agility", value: 0 },
			{ name: "Speed", id: "speed", value: 0 },
			{ name: "Reflex", id: "reflex", value: 0 },
			{ name: "Endurance", id: "endurance", value: 0 },
		],
		elective: {
			name: "Energy",
			id: "energy",
			value: 0
		},
	},
	interpersonal: {
		name: "Interpersonal",
		children: [
			{ name: "Percieved Attractiveness", id: "percievedAttractiveness", value: 0 },
			{ name: "Charm", id: "charm", value: 0 },
			{ name: "Speech", id: "speech", value: 0 },
			{ name: "Empathy", id: "empathy", value: 0 },
		],
		elective: {
			name: "Personality",
			id: "personality",
			value: 0
		},
	},
	intellect: {
		name: "Intellect",
		children: [
			{ name: "Knowledge", id: "knowledge", value: 0 },
			{ name: "Critical Thinking", id: "criticalThinking", value: 0 },
			{ name: "Analysis", id: "analysis", value: 0 },
			{ name: "Judgement", id: "judgement", value: 0 },
		],
		elective: {
			name: "IQ",
			id: "iq",
			value: 0
		},
	},
	psyche: {
		name: "Psyche",
		children: [
			{ name: "Mental Stability", id: "mentalStability", value: 0 },
			{ name: "Emotional Stability", id: "emotionalStability", value: 0 },
			{ name: "Focus and Concentration", id: "focusAndConcentration", value: 0 },
			{ name: "Courage and Conviction", id: "courageAndConviction", value: 0 },
		],
		elective: {
			name: "Faith",
			id: "faith",
			value: 0
		},
	},
	additionalScores: {
		shield: {
			name: "Shield",
			id: "shield",
			description: "",
			value: 0
		},
		reputation: {
			name: "Reputation",
			id: "reputation",
			description: "",
			value: 0
		},
		resurrectionDuration: {
			name: "Resurrection Duration",
			id: "resurrectionDuration",
			description: "",
			value: 0
		},
	}
};

export const PATHS = [
	{
		name: "Theurgist",
		value: "theurgist",
		latin: "Doctrina Acadēmia",
		icon: mdiBookshelf,
		description: "Educated by the masters from the Academia Theurgiae Atomi, their rigorous and highly structured education system has shaped you into one of the premier atom mages of Solum.",
		modifiers: [
			{
				name: "Physical",
				id: "physical",
				modifier: [
					{ id: "agility", name: "Agility", parentId: "physical", value: 5 },
					{ id: "speed", name: "Speed", parentId: "physical", value: -5 },
					{ id: "reflex", name: "Reflex", parentId: "physical", value: 5 },
					{ id: "endurance", name: "Endurance", parentId: "physical", value: 0 }
				]
			},
			{
				name: "Interpersonal",
				id: "interpersonal",
				modifier: [
					{ id: "percievedAttractiveness", name: "Percieved Attractiveness", parentId: "interpersonal", value: 5 },
					{ id: "charm", name: "Charm", parentId: "interpersonal", value: 0 },
					{ id: "speech", name: "Speech", parentId: "interpersonal", value: 5 },
					{ id: "empathy", name: "Empathy", parentId: "interpersonal", value: -5 }
				]
			},
			{
				name: "Intellect",
				id: "intellect",
				modifier: [
					{ id: "knowledge", name: "Knowledge", parentId: "intellect", value: 5 },
					{ id: "criticalThinking", name: "Critical Thinking", parentId: "intellect", value: 0 },
					{ id: "analysis", name: "Analysis", parentId: "intellect", value: 5 },
					{ id: "judgement", name: "Judgement", parentId: "intellect", value: -5 }
				]
			},
			{
				name: "Psyche",
				id: "psyche",
				modifier: [
					{ id: "mentalStability", name: "Mental Stability", parentId: "psyche", value: 5 },
					{ id: "emotionalStability", name: "Emotional Stability", parentId: "psyche", value: -5 },
					{ id: "focusAndConcentration", name: "Focus and Concentration", parentId: "psyche", value: 5 },
					{ id: "courageAndConviction", name: "Courage and Conviction", parentId: "psyche", value: 0 }
				]
			}
		]
	},
	{
		name: "Iconoclast",
		value: "iconoclast",
		latin: "Discipulīna Audax",
		icon: mdiScriptText,
		description: "Schooled by heretical atom mages who shun the restraint and erudite style of the Academia Theurgiae Atomi, you have learned forbidden techniques and must evade the eyes of the Academy.",
		modifiers: [
			{
				name: "Physical",
				id: "physical",
				modifier: [
					{ id: "agility", name: "Agility", parentId: "physical", value: 0 },
					{ id: "speed", name: "Speed", parentId: "physical", value: 5 },
					{ id: "reflex", name: "Reflex", parentId: "physical", value: 5 },
					{ id: "endurance", name: "Endurance", parentId: "physical", value: 0 }
				]
			},
			{
				name: "Interpersonal",
				id: "interpersonal",
				modifier: [
					{ id: "percievedAttractiveness", name: "Percieved Attractiveness", parentId: "interpersonal", value: -5 },
					{ id: "charm", name: "Charm", parentId: "interpersonal", value: 5 },
					{ id: "speech", name: "Speech", parentId: "interpersonal", value: 0 },
					{ id: "empathy", name: "Empathy", parentId: "interpersonal", value: -5 }
				]
			},
			{
				name: "Intellect",
				id: "intellect",
				modifier: [
					{ id: "knowledge", name: "Knowledge", parentId: "intellect", value: 0 },
					{ id: "criticalThinking", name: "Critical Thinking", parentId: "intellect", value: 5 },
					{ id: "analysis", name: "Analysis", parentId: "intellect", value: 5 },
					{ id: "judgement", name: "Judgement", parentId: "intellect", value: 0 }
				]
			},
			{
				name: "Psyche",
				id: "psyche",
				modifier: [
					{ id: "mentalStability", name: "Mental Stability", parentId: "psyche", value: -5 },
					{ id: "emotionalStability", name: "Emotional Stability", parentId: "psyche", value: 5 },
					{ id: "focusAndConcentration", name: "Focus and Concentration", parentId: "psyche", value: 5 },
					{ id: "courageAndConviction", name: "Courage and Conviction", parentId: "psyche", value: -5 }
				]
			}
		]
	},
	{
		name: "Autodidact",
		value: "autodidact",
		latin: "Erudītio Sui",
		icon: mdiHeadCog,
		description: "A wild prodigy, you have learned everything you know through grit, determination, and trial and error. The Academy may turn its nose up at you, but they will still employ you none the less.",
		modifiers: [
			{
				name: "Physical",
				id: "physical",
				modifier: [
					{ id: "agility", name: "Agility", parentId: "physical", value: -5 },
					{ id: "speed", name: "Speed", parentId: "physical", value: -5 },
					{ id: "reflex", name: "Reflex", parentId: "physical", value: 5 },
					{ id: "endurance", name: "Endurance", parentId: "physical", value: 5 }
				]
			},
			{
				name: "Interpersonal",
				id: "interpersonal",
				modifier: [
					{ id: "percievedAttractiveness", name: "Percieved Attractiveness", parentId: "interpersonal", value: 0 },
					{ id: "charm", name: "Charm", parentId: "interpersonal", value: 0 },
					{ id: "speech", name: "Speech", parentId: "interpersonal", value: 5 },
					{ id: "empathy", name: "Empathy", parentId: "interpersonal", value: 5 }
				]
			},
			{
				name: "Intellect",
				id: "intellect",
				modifier: [
					{ id: "knowledge", name: "Knowledge", parentId: "intellect", value: -5 },
					{ id: "criticalThinking", name: "Critical Thinking", parentId: "intellect", value: 5 },
					{ id: "analysis", name: "Analysis", parentId: "intellect", value: 0 },
					{ id: "judgement", name: "Judgement", parentId: "intellect", value: 5 }
				]
			},
			{
				name: "Psyche",
				id: "psyche",
				modifier: [
					{ id: "mentalStability", name: "Mental Stability", parentId: "psyche", value: 0 },
					{ id: "emotionalStability", name: "Emotional Stability", parentId: "psyche", value: -5 },
					{ id: "focusAndConcentration", name: "Focus and Concentration", parentId: "psyche", value: 5 },
					{ id: "courageAndConviction", name: "Courage and Conviction", parentId: "psyche", value: 5 }
				]
			},
		]
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
				page: "Iron_Fist",
				latin: "PUGNUS FERREUS",
				icon: "mdiAnvil",
				description: "Your callous nature makes it easy for you to ignore the concerns of others.",
				levels: [
					{ name: "i", description: "+10% to compell." },
					{ name: "ii", description: "+15% to compell." },
					{ name: "iii", description: "+20% to compell." }
				]
			},
			{
				key: "2",
				name: "Bad Reputation",
				page: "Bad_Reputation",
				latin: "FAMA MALA",
				icon: "mdiBullhorn",
				description: "Word of your nature has built infamy around your name.",
				levels: [
					{ name: "i", description: "-%10 to reputation." },
					{ name: "ii", description: "-%15 to reputation." },
					{ name: "iii", description: "-%20 to reputation." }
				]
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
				page: "Man_is_Matter",
				latin: "HOMO MATERIA EST",
				icon: "mdiAtom",
				description: "Matter and anti-matter are especially receptive to your will.",
				levels: [
					{ name: "i", description: "+10% to atom magic." },
					{ name: "ii", description: "+15% to atom magic." },
					{ name: "iii", description: "+20% to atom magic." }
				]
			},
			{
				key: "2",
				name: "Explosive Touch",
				page: "Explosive_Touch",
				latin: "CONTAGIO DISPLOSA",
				icon: "mdiFire",
				description: "Your heightened atomic powers sometimes cause unexpected things to happen with physical contact.",
				levels: [
					{ name: "i", description: "%10 chance of object spontaneously combusting when touched." },
					{ name: "ii", description: "%15 chance of object spontaneously combusting when touched." },
					{ name: "iii", description: "%20 chance of object spontaneously combusting when touched." }
				]
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
				page: "Reset",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: [
					{ name: "i", description: "+10% to atom magic techniques." },
					{ name: "ii", description: "+15% to atom magic techniques." },
					{ name: "iii", description: "+20% to atom magic techniques." }
				]
			},
			{
				key: "2",
				name: "Overgrown",
				page: "Overgrown",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: [
					{ name: "i", description: "%10 chance of object spontaneously combusting when touched." },
					{ name: "ii", description: "%15 chance of object spontaneously combusting when touched." },
					{ name: "iii", description: "%20 chance of object spontaneously combusting when touched." }
				]
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
				page: "Like_Clockwork",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: [
					{ name: "i", description: "+10%" },
					{ name: "ii", description: "+15%" },
					{ name: "iii", description: "+20%" }
				]
			},
			{
				key: "2",
				name: "Losing Track of Time",
				page: "Losing_Track_of_Time",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: [
					{ name: "i", description: "+10%" },
					{ name: "ii", description: "+15%" },
					{ name: "iii", description: "+20%" }
				]
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
				page: "Master_Manipulator",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: [
					{ name: "i", description: "+10%" },
					{ name: "ii", description: "+15%" },
					{ name: "iii", description: "+20%" }
				]
			},
			{
				key: "2",
				name: "Untrustworthy",
				page: "Untrustworthy",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: [
					{ name: "i", description: "+10%" },
					{ name: "ii", description: "+15%" },
					{ name: "iii", description: "+20%" }
				]
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
				page: "",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: [
					{ name: "i", description: "+10%" },
					{ name: "ii", description: "+15%" },
					{ name: "iii", description: "+20%" }
				]
			},
			{
				key: "2",
				name: "Half-life",
				page: "Half-life",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: [
					{ name: "i", description: "+10%" },
					{ name: "ii", description: "+15%" },
					{ name: "iii", description: "+20%" }
				]
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
				page: "",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: [
					{ name: "i", description: "+10%" },
					{ name: "ii", description: "+15%" },
					{ name: "iii", description: "+20%" }
				]
			},
			{
				key: "2",
				name: "Half-life",
				page: "Half-life",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: [
					{ name: "i", description: "+10%" },
					{ name: "ii", description: "+15%" },
					{ name: "iii", description: "+20%" }
				]
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
				page: "",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: [
					{ name: "i", description: "+10%" },
					{ name: "ii", description: "+15%" },
					{ name: "iii", description: "+20%" }
				]
			},
			{
				key: "2",
				name: "Half-life",
				page: "",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: [
					{ name: "i", description: "+10%" },
					{ name: "ii", description: "+15%" },
					{ name: "iii", description: "+20%" }
				]
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
				page: "",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: [
					{ name: "i", description: "+10%" },
					{ name: "ii", description: "+15%" },
					{ name: "iii", description: "+20%" }
				]
			},
			{
				key: "2",
				name: "Half-life",
				page: "",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: [
					{ name: "i", description: "+10%" },
					{ name: "ii", description: "+15%" },
					{ name: "iii", description: "+20%" }
				]
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
				page: "",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: [
					{ name: "i", description: "+10%" },
					{ name: "ii", description: "+15%" },
					{ name: "iii", description: "+20%" }
				]
			},
			{
				key: "2",
				name: "Half-life",
				page: "",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: [
					{ name: "i", description: "+10%" },
					{ name: "ii", description: "+15%" },
					{ name: "iii", description: "+20%" }
				]
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
				page: "",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: [
					{ name: "i", description: "+10%" },
					{ name: "ii", description: "+15%" },
					{ name: "iii", description: "+20%" }
				]
			},
			{
				key: "2",
				name: "Half-life",
				page: "",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: [
					{ name: "i", description: "+10%" },
					{ name: "ii", description: "+15%" },
					{ name: "iii", description: "+20%" }
				]
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
				page: "",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: [
					{ name: "i", description: "+10%" },
					{ name: "ii", description: "+15%" },
					{ name: "iii", description: "+20%" }
				]
			},
			{
				key: "2",
				name: "Half-life",
				page: "",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: [
					{ name: "i", description: "+10%" },
					{ name: "ii", description: "+15%" },
					{ name: "iii", description: "+20%" }
				]
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
				page: "",
				latin: "",
				icon: "mdiAtom",
				description: "",
				levels: [
					{ name: "i", description: "+10%" },
					{ name: "ii", description: "+15%" },
					{ name: "iii", description: "+20%" }
				]
			},
			{
				key: "2",
				name: "Half-life",
				page: "",
				latin: "",
				icon: "mdiFire",
				description: "",
				levels: [
					{ name: "i", description: "+10%" },
					{ name: "ii", description: "+15%" },
					{ name: "iii", description: "+20%" }
				]
			}
		]
	}
];

export const GEAR = {
	weapons: {
		theurgist: [
			{
				name: "Basic Staff",
				key: "basicStaff",
				latin: "Baculum Simplex",
				description: "A simple and unadorned staff for focusing and directing energy.",
				type: "weapon",
				damageBonus: 0,
				shieldBonus: 0,
				modifiers: [
					{ key: "speed", parent: "physical", child: "speed", value: 5, }
				],
				value: 1
			},
			{
				name: "Basic Staff of Endurance",
				key: "basicStaffOfEndurance",
				latin: "Baculum Simplex Patientiae",
				description: "This basic staff absorbs energy on behalf of the owner, increasing their endurance.",
				type: "weapon",
				damageBonus: 0,
				shieldBonus: 0,
				modifiers: [
					{ key: "endurance", parent: "physical", child: "endurance", value: 5, }
				],
				value: 2
			},
			{
				name: "Basic Staff of Electron Excitement",
				key: "basicStaffofElectronExcitement",
				latin: "Baculum Simplex Īrae Ēlectōrum",
				description: "This staff heightens the excitement of electrons that pass through it, giving a bonus to damage.",
				type: "weapon",
				damageBonus: 5,
				shieldBonus: 0,
				modifiers: [
					{ key: "reflex", parent: "physical", child: "reflex", value: 5, }
				],
				value: 3
			},
		],
		iconoclast: [
			{
				name: "Basic Sword",
				key: "basicSword",
				latin: "Gladius Simplex",
				description: "A simple and unadorned sword for hacking, slashing, and stabbing.",
				type: "weapon",
				damageBonus: 0,
				shieldBonus: 0,
				modifiers: [
					{ key: "endurance", parent: "physical", child: "endurance", value: 5, }
				],
				value: 1
			},
			{
				name: "Basic Sword of Endurance",
				key: "basicSwordOfEndurance",
				latin: "Gladius Simplex Patientiae",
				description: "This basic sword absorbs energy on behalf of the owner, increasing their endurance.",
				type: "weapon",
				damageBonus: 0,
				shieldBonus: 0,
				modifiers: [
					{ key: "reflex", parent: "physical", child: "reflex", value: 5, }
				],
				value: 2
			},
		],
		autodidact: [
			{
				name: "Basic Sword",
				key: "basicSword",
				latin: "Gladius Simplex",
				description: "A simple and unadorned sword for hacking, slashing, and stabbing.",
				type: "weapon",
				damageBonus: 0,
				shieldBonus: 0,
				modifiers: [
					{ key: "reflex", parent: "physical", child: "reflex", value: 5, }
				],
				value: 1
			},
			{
				name: "Basic Sword of Endurance",
				key: "basicSwordOfEndurance",
				latin: "Gladius Simplex Patientiae",
				description: "This basic sword absorbs energy on behalf of the owner, increasing their endurance.",
				type: "weapon",
				damageBonus: 0,
				shieldBonus: 0,
				modifiers: [
					{ key: "endurance", parent: "physical", child: "endurance", value: 5, }
				],
				value: 2
			},
		],
	},
	armor: {
		theurgist: [
			{
				name: "Basic Cloak",
				key: "basicCloak",
				latin: "Lacerna Simplex",
				description: "A basic wool cloak fastened at the shoulder.",
				type: "armor",
				damageBonus: 0,
				shieldBonus: 5,
				modifiers: [
					{ key: "reflex", parent: "physical", child: "reflex", value: 5, }
				],
				value: 1
			},
			{
				name: "Basic Cloak of Endurance",
				key: "basicCloakOfEndurance",
				latin: "Lacerna Simplex Patientiae",
				description: "A basic wool cloak that fastens at the shoulder and aborbs energy on behalf of the wearer, increasing endurance.",
				type: "armor",
				damageBonus: 0,
				shieldBonus: 5,
				modifiers: [
					{ key: "endurance", parent: "physical", child: "endurance", value: 5, }
				],
				value: 2
			},
		],
		iconoclast: [
			{
				name: "Basic Curiass",
				key: "basicCuirass",
				latin: "Lōrīca Simplex",
				description: "A basic leather cuirass fitted to the wearer.",
				type: "armor",
				damageBonus: 0,
				shieldBonus: 5,
				modifiers: [
					{ key: "speed", parent: "physical", child: "speed", value: 5, }
				],
				value: 1
			},
			{
				name: "Basic Cuirass of Endurance",
				key: "basicCuirassOfEndurance",
				latin: "Lōrīca Simplex Patientiae",
				description: "A basic wool cloak that fastens at the shoulder and aborbs energy on behalf of the wearer, increasing endurance.",
				type: "armor",
				damageBonus: 0,
				shieldBonus: 5,
				modifiers: [
					{ key: "endurance", parent: "physical", child: "endurance", value: 5, }
				],
				value: 2
			},
		],
		autodidact: [
			{
				name: "Basic Curiass",
				key: "basicCuirass",
				latin: "Lōrīca Simplex",
				description: "A basic leather cuirass fitted to the wearer.",
				type: "armor",
				damageBonus: 0,
				shieldBonus: 5,
				modifiers: [
					{ key: "speed", parent: "physical", child: "speed", value: 5, }
				],
				value: 1
			},
			{
				name: "Basic Cuirass of Endurance",
				key: "basicCuirassOfEndurance",
				latin: "Lōrīca Simplex Patientiae",
				description: "A basic wool cloak that fastens at the shoulder and aborbs energy on behalf of the wearer, increasing endurance.",
				type: "armor",
				damageBonus: 0,
				shieldBonus: 5,
				modifiers: [
					{ key: "endurance", parent: "physical", child: "endurance", value: 5, }
				],
				value: 2
			},
		],
	},
	other: [
		{
			name: "Basic Item",
			key: "basicItem",
			latin: "",
			description: "Asdfsdf",
			type: "other",
			damageBonus: 0,
			shieldBonus: 0,
			modifiers: [],
			value: 1
		},
		{
			name: "Basic Item of something",
			key: "basicItemOfSomething",
			latin: "",
			description: "Asdfsdf",
			type: "other",
			damageBonus: 0,
			shieldBonus: 0,
			modifiers: [],
			value: 2
		},
	]
};

export const WEALTH = [
	{
		name: "Silver",
		id: "silver",
		description: "Individual coins, and the most common form of coinage in Solum.",
		type: "currency",
		VIG: 0.001,
	},
	{
		name: "Gold",
		id: "gold",
		description: "Individual coins, and the standard used for monetary value.",
		type: "currency",
		VIG: 1,
	},
	{
		name: "Lead",
		id: "lead",
		description: "25lbs lead bar. Useful in crafting and in trading currency.",
		type: "resource",
		VIG: 2,
	},
	{
		name: "Uranium",
		id: "uranium",
		description: "1lb uranium bar. Useful in crafting and in trading for currency.",
		type: "resource",
		VIG: 5,
	},
];

export const ANIMAL_COMPANIONS = {
	canidae: {
		name: "Canidae",
		id: "canidae",
		children: [
			{ name: "Domestic Dog", id: "domesticDog", description: "" },
			{ name: "Wolf", id: "wolf", description: "" },
			{ name: "Coyote", id: "coyote", description: "" },
			{ name: "Fox", id: "Fox", description: "" },
			{ name: "Jackal", id: "jackal", description: "" },
			{ name: "Other", id: "otherCanidae", description: "" },
		]
	},
	felidae: {
		name: "Felidae",
		id: "felidae",
		children: [
			{ name: "Domestic Cat", id: "domesticCat", description: "" },
			{ name: "Lion", id: "lion", description: "" },
			{ name: "Tiger", id: "tiger", description: "" },
			{ name: "Cougar", id: "cougar", description: "" },
			{ name: "Bobcat", id: "bobcat", description: "" },
			{ name: "Other", id: "otherFelidae", description: "" },
		]
	},
	rodentia: {
		name: "Rodentia",
		id: "rodentia",
		children: [
			{ name: "Mouse", id: "mouse", description: "" },
			{ name: "Rat", id: "rat", description: "" },
			{ name: "Squirrel", id: "squirrel", description: "" },
			{ name: "rabbit", id: "rabbit", description: "" },
			{ name: "Other", id: "otherRodentia", description: "" },
		]
	},
	primates: {
		name: "Primates",
		id: "primates",
		children: [
			{ name: "Chimpanzee", id: "chimpanzee", description: "" },
			{ name: "Lemur", id: "lemur", description: "" },
			{ name: "Monkey", id: "monkey", description: "" },
			{ name: "Babboon", id: "Babboon", description: "" },
			{ name: "Other", id: "otherPrimates", description: "" },
		]
	},
	aves: {
		name: "Aves",
		id: "aves",
		children: [
			{ name: "Hawk", id: "hawk", description: "" },
			{ name: "Eagle", id: "eagle", description: "" },
			{ name: "Owl", id: "owl", description: "" },
			{ name: "Dove", id: "dove", description: "" },
			{ name: "Sparrow", id: "sparrow", description: "" },
			{ name: "Crow", id: "crow", description: "" },
			{ name: "Parrot", id: "parrot", description: "" },
			{ name: "Other", id: "otherAves", description: "" },
		]
	},
	reptilia: {
		name: "Reptilia",
		id: "reptilia",
		children: [
			{ name: "Snake", id: "snake", description: "" },
			{ name: "Lizard", id: "lizard", description: "" },
			{ name: "Crocodile", id: "crocodile", description: "" },
			{ name: "Tortoise", id: "tortoise", description: "" },
			{ name: "Other", id: "otherReptilia", description: "" },
		]
	},
	other: {
		name: "Other",
		id: "other",
		children: [
			{ name: "Other", id: "otherOther", description: "" },
		]
	},
};