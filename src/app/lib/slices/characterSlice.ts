import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

interface Subscore {
	child: string,
	value: number
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
	scores: {
		physical: {
			value: 0,
			subscores: {
				agility: number,
				speed: number,
				reflex: number,
				endurance: number,
			}
		},
		interpersonal: {
			value: 0,
			subscores: {
				percievedAttractiveness: number,
				charm: number,
				speech: number,
				empathy: number,
			}
		},
		intellect: {
			value: 0,
			subscores: {
				knowledge: number,
				criticalThinking: number,
				analysis: number,
				judgement: number,
			}
		},
		psyche: {
			value: 0,
			subscores: {
				mentalStability: number,
				emotionalStability: number,
				focusAndConcentration: number,
				courageAndConviction: number,
			}
		}
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
	scores: {
		physical: {
			value: 0,
			subscores: {
				agility: 50,
				speed: 50,
				reflex: 50,
				endurance: 50,
			}
		},
		interpersonal: {
			value: 0,
			subscores: {
				percievedAttractiveness: 50,
				charm: 50,
				speech: 50,
				empathy: 50,
			}
		},
		intellect: {
			value: 0,
			subscores: {
				knowledge: 50,
				criticalThinking: 50,
				analysis: 50,
				judgement: 50,
			}
		},
		psyche: {
			value: 0,
			subscores: {
				mentalStability: 50,
				emotionalStability: 50,
				focusAndConcentration: 50,
				courageAndConviction: 50,
			}
		}
	},
	gear: [],
}

export const characterSlice = createSlice({
  name: 'character',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
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
	},
	setInterpersonalSubscore: (state, action: PayloadAction<Subscore>) => {
		// expects child, value
		state.scores.interpersonal.subscores[action.payload.child as keyof typeof state.scores.interpersonal.subscores] = action.payload.value;
	},
	setIntellectSubscore: (state, action: PayloadAction<Subscore>) => {
		// expects child, value
		state.scores.intellect.subscores[action.payload.child as keyof typeof state.scores.intellect.subscores] = action.payload.value;
	},
	setPsycheSubscore: (state, action: PayloadAction<Subscore>) => {
		// expects child, value
		state.scores.psyche.subscores[action.payload.child as keyof typeof state.scores.psyche.subscores] = action.payload.value;
	},
  }
})

export const {
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
	setPsycheSubscore } = characterSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const characterName = (state: RootState) => state.character.name

export default characterSlice.reducer