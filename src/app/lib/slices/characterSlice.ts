import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// Define a type for the slice state
export interface CharacterState {
	name: string,
	age: number,
	pronouns: string,
	description: string,
	culture: string,
	path: string,
	patronage: string,
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
	setGear: (state, action: PayloadAction<string>) => {
		action.payload.forEach(w => {
			state.gear.push(w);
		});
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
	setGear, } = characterSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const characterName = (state: RootState) => state.character.name

export default characterSlice.reducer