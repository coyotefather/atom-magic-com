import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

interface Attack {
	id: string;
	name: string;
	damage: string;
}

interface SpecialAbility {
	id: string;
	name: string;
	description: string;
}

export interface CustomCreatureState {
	loaded: boolean;
	id: string;
	name: string;
	description: string;
	// Scores
	physical: number;
	interpersonal: number;
	intellect: number;
	psyche: number;
	// Combat
	health: number;
	physicalShield: number;
	psychicShield: number;
	armorCapacity: number;
	// Lists
	attacks: Attack[];
	specialAbilities: SpecialAbility[];
	// Tags
	challengeLevel: string;
	creatureType: string;
	environments: string[];
	isSwarm: boolean;
	isUnique: boolean;
	// Reference
	basedOnId: string | null;
	basedOnName: string | null;
	// Meta
	lastModified: string;
}

const initialState: CustomCreatureState = {
	loaded: false,
	id: '',
	name: '',
	description: '',
	physical: 10,
	interpersonal: 10,
	intellect: 10,
	psyche: 10,
	health: 10,
	physicalShield: 0,
	psychicShield: 0,
	armorCapacity: 0,
	attacks: [],
	specialAbilities: [],
	challengeLevel: 'moderate',
	creatureType: '',
	environments: [],
	isSwarm: false,
	isUnique: false,
	basedOnId: null,
	basedOnName: null,
	lastModified: '',
}

export const customCreatureSlice = createSlice({
	name: 'customCreature',
	initialState,
	reducers: {
		loadCreature: (_state, action: PayloadAction<CustomCreatureState>) => {
			return { ...action.payload, loaded: true };
		},
		clearCreature: () => {
			return { ...initialState };
		},
		setCreatureName: (state, action: PayloadAction<string>) => {
			state.name = action.payload;
		},
		setCreatureDescription: (state, action: PayloadAction<string>) => {
			state.description = action.payload;
		},
		setCreatureScore: (state, action: PayloadAction<{ field: 'physical' | 'interpersonal' | 'intellect' | 'psyche'; value: number }>) => {
			state[action.payload.field] = action.payload.value;
		},
		setCreatureHealth: (state, action: PayloadAction<number>) => {
			state.health = action.payload;
		},
		setCreaturePhysicalShield: (state, action: PayloadAction<number>) => {
			state.physicalShield = action.payload;
		},
		setCreaturePsychicShield: (state, action: PayloadAction<number>) => {
			state.psychicShield = action.payload;
		},
		setCreatureArmorCapacity: (state, action: PayloadAction<number>) => {
			state.armorCapacity = action.payload;
		},
		setCreatureChallengeLevel: (state, action: PayloadAction<string>) => {
			state.challengeLevel = action.payload;
		},
		setCreatureType: (state, action: PayloadAction<string>) => {
			state.creatureType = action.payload;
		},
		setCreatureEnvironments: (state, action: PayloadAction<string[]>) => {
			state.environments = action.payload;
		},
		setCreatureIsSwarm: (state, action: PayloadAction<boolean>) => {
			state.isSwarm = action.payload;
		},
		setCreatureIsUnique: (state, action: PayloadAction<boolean>) => {
			state.isUnique = action.payload;
		},
		addAttack: (state) => {
			state.attacks.push({
				id: crypto.randomUUID(),
				name: '',
				damage: '',
			});
		},
		updateAttack: (state, action: PayloadAction<{ id: string; field: 'name' | 'damage'; value: string }>) => {
			const attack = state.attacks.find(a => a.id === action.payload.id);
			if (attack) {
				attack[action.payload.field] = action.payload.value;
			}
		},
		removeAttack: (state, action: PayloadAction<string>) => {
			state.attacks = state.attacks.filter(a => a.id !== action.payload);
		},
		addSpecialAbility: (state) => {
			state.specialAbilities.push({
				id: crypto.randomUUID(),
				name: '',
				description: '',
			});
		},
		updateSpecialAbility: (state, action: PayloadAction<{ id: string; field: 'name' | 'description'; value: string }>) => {
			const ability = state.specialAbilities.find(a => a.id === action.payload.id);
			if (ability) {
				ability[action.payload.field] = action.payload.value;
			}
		},
		removeSpecialAbility: (state, action: PayloadAction<string>) => {
			state.specialAbilities = state.specialAbilities.filter(a => a.id !== action.payload);
		},
		setBasedOn: (state, action: PayloadAction<{ id: string | null; name: string | null }>) => {
			state.basedOnId = action.payload.id;
			state.basedOnName = action.payload.name;
		},
	},
})

export const {
	loadCreature,
	clearCreature,
	setCreatureName,
	setCreatureDescription,
	setCreatureScore,
	setCreatureHealth,
	setCreaturePhysicalShield,
	setCreaturePsychicShield,
	setCreatureArmorCapacity,
	setCreatureChallengeLevel,
	setCreatureType,
	setCreatureEnvironments,
	setCreatureIsSwarm,
	setCreatureIsUnique,
	addAttack,
	updateAttack,
	removeAttack,
	addSpecialAbility,
	updateSpecialAbility,
	removeSpecialAbility,
	setBasedOn,
} = customCreatureSlice.actions

export const selectCustomCreature = (state: RootState) => state.customCreature

export default customCreatureSlice.reducer
