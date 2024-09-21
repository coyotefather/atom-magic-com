import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

interface Score {
	_id: string,
	title: string | null,
	id: string | null,
	subscores: any[],
	description: string | null[]
};

interface Subscore {
	child: string,
	value: number
};

interface AnimalCompanion {
	id: string,
	name: string,
	details: string
};

interface Wealth {
	silver: number,
	gold: number,
	lead: number,
	uranium: number
};

// Define a type for the slice state
export interface CharacterState {
	name: string,
	age: number,
	pronouns: string,
	description: string,
	culture: string,
	path: string,
	patronage: string,
	score: Array<Score>,
	scores: {
		physical: {
			value: number,
			subscores: {
				agility: number,
				speed: number,
				reflex: number,
				endurance: number,
			}
		},
		interpersonal: {
			value: number,
			subscores: {
				percievedAttractiveness: number,
				charm: number,
				speech: number,
				empathy: number,
			}
		},
		intellect: {
			value: number,
			subscores: {
				knowledge: number,
				criticalThinking: number,
				analysis: number,
				judgement: number,
			}
		},
		psyche: {
			value: number,
			subscores: {
				mentalStability: number,
				emotionalStability: number,
				focusAndConcentration: number,
				courageAndConviction: number,
			}
		},
		additionalScores: {
			shield: number,
			reputation: number,
			resurrectionDuration: number,
		},
	},
	gear: {
		name: string,
		key: string,
		latin: string,
		description: string,
		type: string,
		damageBonus: number,
		shieldBonus: number,
		modifiers: {
			key: string,
			parent: string,
			child: string,
			value: number,
		}[],
		value: number
	}[],
	wealth: {
		silver: number,
		gold: number,
		lead: number,
		uranium: number
	},
	animalCompanion: {
		id: string,
		name: string,
		details: string
	},
}

// Define the initial state using that type
const initialState: CharacterState = {
	name: "",
	age: 0,
	pronouns: "",
	description: "",
	culture: "",
	path: "",
	patronage: "",
	score: [],
	scores: {
		physical: {
			value: 50,
			subscores: {
				agility: 50,
				speed: 50,
				reflex: 50,
				endurance: 50,
			}
		},
		interpersonal: {
			value: 50,
			subscores: {
				percievedAttractiveness: 50,
				charm: 50,
				speech: 50,
				empathy: 50,
			}
		},
		intellect: {
			value: 50,
			subscores: {
				knowledge: 50,
				criticalThinking: 50,
				analysis: 50,
				judgement: 50,
			}
		},
		psyche: {
			value: 50,
			subscores: {
				mentalStability: 50,
				emotionalStability: 50,
				focusAndConcentration: 50,
				courageAndConviction: 50,
			}
		},
		additionalScores: {
			shield: 50,
			reputation: 0,
			resurrectionDuration: 10,
		},
	},
	gear: [],
	wealth: {
		silver: 0,
		gold: 0,
		lead: 0,
		uranium: 0
	},
	animalCompanion: {
		id: "",
		name: "",
		details: ""
	},
}

export const characterSlice = createSlice({
  name: 'character',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
	initScore: (state, action: PayloadAction<Score[]>) => {
		if(state.score.length === 0) {
			action.payload.forEach( (score: Score) => {
				state.score.push(score);
			} );
		}
		//state.score.push(action.payload);
	},
	setCharacterName: (state, action: PayloadAction<string>) => {
		state.name = action.payload;
	},
	setCharacterAge: (state, action: PayloadAction<number>) => {
		state.age = action.payload;
	},
	setCharacterPronouns: (state, action: PayloadAction<string>) => {
		state.pronouns = action.payload;
	},
	setCharacterDescription: (state, action: PayloadAction<string>) => {
		state.description = action.payload;
	},
	setCulture: (state, action: PayloadAction<string>) => {
		state.culture = action.payload;
	},
	setPath: (state, action: PayloadAction<string>) => {
		state.path = action.payload;
	},
	setPatronage: (state, action: PayloadAction<string>) => {
		state.patronage = action.payload;
	},
	setGear: (state, action: PayloadAction<Array<any>>) => {
		action.payload.forEach(w => {
			state.gear.push(w);
		});
	},
	setPhysicalSubscore: (state, action: PayloadAction<Subscore>) => {
		// expects child, value
		state.scores.physical.subscores[action.payload.child as keyof typeof state.scores.physical.subscores] = action.payload.value;
		state.scores.physical.value = Math.round((state.scores.physical.subscores.agility + state.scores.physical.subscores.speed + state.scores.physical.subscores.reflex + state.scores.physical.subscores.endurance)/4);
	},
	setInterpersonalSubscore: (state, action: PayloadAction<Subscore>) => {
		// expects child, value
		state.scores.interpersonal.subscores[action.payload.child as keyof typeof state.scores.interpersonal.subscores] = action.payload.value;
		state.scores.interpersonal.value = Math.round((state.scores.interpersonal.subscores.percievedAttractiveness + state.scores.interpersonal.subscores.charm + state.scores.interpersonal.subscores.speech + state.scores.interpersonal.subscores.empathy)/4);
	},
	setIntellectSubscore: (state, action: PayloadAction<Subscore>) => {
		// expects child, value
		state.scores.intellect.subscores[action.payload.child as keyof typeof state.scores.intellect.subscores] = action.payload.value;
		state.scores.intellect.value = Math.round((state.scores.intellect.subscores.knowledge + state.scores.intellect.subscores.criticalThinking + state.scores.intellect.subscores.analysis + state.scores.intellect.subscores.judgement)/4);
	},
	setPsycheSubscore: (state, action: PayloadAction<Subscore>) => {
		// expects child, value
		state.scores.psyche.subscores[action.payload.child as keyof typeof state.scores.psyche.subscores] = action.payload.value;
		state.scores.psyche.value = Math.round((state.scores.psyche.subscores.mentalStability + state.scores.psyche.subscores.emotionalStability + state.scores.psyche.subscores.focusAndConcentration + state.scores.psyche.subscores.courageAndConviction)/4);
	},
	setShield: (state) => {
		state.scores.additionalScores.shield = Math.round((state.scores.physical.subscores.endurance + state.scores.psyche.subscores.mentalStability)/2);
	},
	setReputation: (state) => {
		state.scores.additionalScores.reputation = Math.round((state.scores.interpersonal.subscores.speech + state.scores.interpersonal.subscores.charm + state.scores.intellect.subscores.criticalThinking + state.scores.intellect.subscores.judgement)/10);
	},
	setResurrectionDuration: (state) => {
		state.scores.additionalScores.resurrectionDuration = Math.round(((state.scores.physical.subscores.endurance + state.scores.physical.subscores.speed + state.scores.psyche.subscores.mentalStability + state.scores.psyche.subscores.emotionalStability)/10)/10);
	},
	setWealth: (state, action: PayloadAction<Wealth>) => {
		state.wealth.silver = action.payload.silver;
		state.wealth.gold = action.payload.gold;
		state.wealth.lead = action.payload.lead;
		state.wealth.uranium = action.payload.uranium;
	},
	setAnimalCompanion: (state, action: PayloadAction<AnimalCompanion>) => {
		state.animalCompanion.name = action.payload.name;
		state.animalCompanion.id = action.payload.id;
		state.animalCompanion.details = action.payload.details;
	},
  }
})

export const {
	initScore,
	setCharacterName,
	setCharacterAge,
	setCharacterPronouns,
	setCharacterDescription,
	setCulture,
	setPath,
	setPatronage,
	setGear,
	setPhysicalSubscore,
	setInterpersonalSubscore,
	setIntellectSubscore,
	setPsycheSubscore,
    setShield,
	setReputation,
	setResurrectionDuration,
	setWealth,
	setAnimalCompanion } = characterSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const characterName = (state: RootState) => state.character.name

export default characterSlice.reducer