import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import {
	CULTURES_QUERYResult,
	SCORES_QUERYResult,
	ADDITIONAL_SCORES_QUERYResult,
	PATHS_QUERYResult,
	PATRONAGES_QUERYResult,
	DISCIPLINES_QUERYResult,
	GEAR_QUERYResult,
} from "../../../sanity.types";

interface SanityScore {
	_id: string,
	title: string | null,
	subscores: SanitySubscore[] | null,
	description: string | null
};

interface SanitySubscore {
	_id: string,
	title: string | null,
	description: string | null,
	defaultValue: number | null
};

interface LocalSubscore {
	_id: string,
	title: string | null,
	description: string | null,
	value: number | null
};

interface Score {
	_id: string,
	title: string | null,
	subscores: {
		_id: string,
		title: string | null,
		description: string | null,
		value: number | null
	}[],
	description: string | null,
	value: number | null
};

// interface ScoreUpdate {
// 	_id: string,
// 	value: number,
// };

interface SubscoreUpdate {
	_id: string,
	parent_id: string,
	value: number,
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
	loaded: boolean,
	name: string,
	age: number,
	pronouns: string,
	description: string,
	culture: string,
	path: string,
	patronage: string,
	scorePoints: number,
	scores: Array<Score>,
	additionalScores: ADDITIONAL_SCORES_QUERYResult,
	disciplines: Array<string>,
	techniques: Array<string>,
	gear: GEAR_QUERYResult,
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
	loaded: false,
	name: "",
	age: 0,
	pronouns: "",
	description: "",
	culture: "",
	path: "",
	patronage: "",
	scorePoints: 0,
	scores: [],
	additionalScores: [],
	disciplines: [],
	techniques: [],
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
	initScore: (state, action: PayloadAction<SanityScore[]>) => {
		if(state.scores.length === 0) {
			let subs: LocalSubscore[];
			let scoreAverage: number;
			let subscoreCount: number;
			action.payload.forEach( (score: SanityScore) => {
				subs = [];
				scoreAverage = 0;
				subscoreCount = 0;
				if(score.subscores) {
					score.subscores.map((s) => {
						s.defaultValue ? scoreAverage += s.defaultValue : scoreAverage;
						subscoreCount++;
						subs.push(
							{
								_id: s._id,
								title: s.title,
								description: s.description,
								value: s.defaultValue
							}
						);
					});
				}
				scoreAverage = Math.round(scoreAverage / subscoreCount);
				state.scores.push({
					_id: score._id,
					title: score.title,
					subscores: subs,
					description: score.description,
					value: scoreAverage
				});
			} );
			state.loaded = true;
		}
	},
	// setLoaded: (state, action: PayloadAction<boolean>) => {
	// 	state.loaded = action.payload;
	// },
	initAdditionalScores: (state, action: PayloadAction<ADDITIONAL_SCORES_QUERYResult>) => {
		if(state.additionalScores.length === 0) {
			state.additionalScores = action.payload;
			//state.loaded = true;
		}
	},
	setAdditionalScores: (state) => {
		let updatedAdditionalScores = state.additionalScores;
		updatedAdditionalScores.forEach( (as) => {
			let newScore = 0;
			let subscores: number[]
			subscores = [];
			// get all subscores
			// score.subscores._id
			if(as.scores !== null) {
				as.scores.forEach( (s) => {
					let found: number | null;
					found = 0;
					state.scores.find( (ts) => {
						ts.subscores.forEach( ss => {
							if(ss._id === s._id) {
								found = ss.value;
							}
						});
					})
					subscores.push(found);
				});
			}
			switch(as.calculation) {
				case "sum":
					subscores.forEach( s => {
						newScore += s;
					});
					break;
				case "difference":
					subscores.forEach( s => {
						newScore -= s;
					});
					break;
				case "multiply":
					subscores.forEach( s => {
						newScore *= s;
					});
					break;
				case "divide":
					subscores.forEach( s => {
						newScore = newScore/s;
					});
					break;
				default: break;
			}
			if(as.additionalCalculations) {
				as.additionalCalculations.forEach( ac => {
					if(ac.value) {
						switch(ac.calculationType) {
							case "sum":
									newScore += ac.value;
								break;
							case "difference":
									newScore -= ac.value;
								break;
							case "multiply":
									newScore *= ac.value;
								break;
							case "divide":
									newScore = newScore/ac.value;
								break;
							default: break;
						}
					}
				});
			}
			as.value = Math.round(newScore);
		});
		state.additionalScores = updatedAdditionalScores;
	},
	setScorePoints: (state, action: PayloadAction<number>) => {
		state.scorePoints = action.payload;
	},
	setSubscore: (state, action: PayloadAction<SubscoreUpdate>) => {
		const updatedScores = state.scores.map( (score: Score)  => {
			if (score._id === action.payload.parent_id) {
				let total = 0;
				score.subscores.map( (sub) => {
					if (sub._id === action.payload._id) {
						sub.value = action.payload.value;
						sub.value !== null ? total += action.payload.value : undefined;
					} else {
						sub.value !== null ? total += sub.value : undefined;
					}
					return sub;
				});

				score.subscores.length > 0 ? total = total/score.subscores.length : total;
				score.value = Math.round(total);
			}
			return score;
		});
		state.scores = updatedScores;

		// update additional scores
	},
	setDisciplines: (state, action: PayloadAction<string[]>) => {
		state.disciplines = action.payload;
	},
	setTechniques: (state, action: PayloadAction<string[]>) => {
		state.techniques = action.payload;
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
	setGear: (state, action: PayloadAction<GEAR_QUERYResult>) => {
		state.gear = action.payload;
	},
	// setShield: (state) => {
	// 	state.scores.additionalScores.shield = Math.round((state.scores.physical.subscores.endurance + state.scores.psyche.subscores.mentalStability)/2);
	// },
	// setReputation: (state) => {
	// 	state.scores.additionalScores.reputation = Math.round((state.scores.interpersonal.subscores.speech + state.scores.interpersonal.subscores.charm + state.scores.intellect.subscores.criticalThinking + state.scores.intellect.subscores.judgement)/10);
	// },
	// setResurrectionDuration: (state) => {
	// 	state.scores.additionalScores.resurrectionDuration = Math.round(((state.scores.physical.subscores.endurance + state.scores.physical.subscores.speed + state.scores.psyche.subscores.mentalStability + state.scores.psyche.subscores.emotionalStability)/10)/10);
	// },
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
	initAdditionalScores,
	//setScore,
	setScorePoints,
	setSubscore,
	setAdditionalScores,
	setCharacterName,
	setCharacterAge,
	setCharacterPronouns,
	setCharacterDescription,
	setCulture,
	setPath,
	setPatronage,
	setDisciplines,
	setTechniques,
	setGear,
	// setPhysicalSubscore,
	// setInterpersonalSubscore,
	// setIntellectSubscore,
	// setPsycheSubscore,
    // setShield,
	// setReputation,
	// setResurrectionDuration,
	setWealth,
	setAnimalCompanion } = characterSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const characterName = (state: RootState) => state.character.name

export default characterSlice.reducer