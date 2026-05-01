/**
 * characterSlice.ts
 *
 * Redux Toolkit slice managing all state for the Character Manager.
 *
 * The Character Manager is a multi-step creation wizard that walks a user
 * through building an Atom Magic character. This slice stores the working
 * state of whichever character is currently being edited — their name, culture,
 * path, scores, gear, disciplines, etc.
 *
 * Key concepts:
 *
 *   Scores and Subscores:
 *     Atom Magic characters have four core Scores (Physical, Interpersonal,
 *     Intellect, Psyche), each composed of several Subscores. The score value
 *     is the average of its subscores. Subscores are what the user actually
 *     adjusts — score values are derived automatically.
 *
 *   Additional Scores:
 *     Derived stats (e.g. Shield, Reputation) calculated from one or more
 *     subscores using a formula stored in the CMS (sum, difference, multiply,
 *     divide) plus optional flat adjustments. Recalculated by `setAdditionalScores`.
 *
 *   The `_id` convention:
 *     Payload CMS documents use `id: number`, but the character components were
 *     originally written for Sanity CMS which used `_id: string`. The `NormedXxx`
 *     types in character-types.ts add `_id = String(id)` for compatibility.
 *     This slice uses those normed types for scores and additional scores.
 *
 *   Persistence:
 *     `saveCharacter` writes state to localStorage. `loadCharacter` restores
 *     it. `clearCharacter` removes it. These interact with characterPersistence.ts.
 *     Auto-save is triggered from the Sections.tsx component on relevant changes.
 *
 *   Initialization:
 *     Scores and additional scores are initialized from CMS data fetched
 *     server-side via fetchCharacterData.ts. They're not hardcoded here because
 *     the score definitions (including subscore names and default values) live in
 *     the Payload CMS and can be changed by an admin.
 *
 * Consumed by:
 *   - src/app/components/character/ (all character creation section components)
 *   - src/lib/hooks/useCharacterPersistence.ts
 *   - src/lib/hooks/useCharacterValidation.ts
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { NormedAdditionalScore, NormedScore } from '../character-types';
import { CharacterGearItem } from '../gear-data';
import { saveCharacterToStorage, clearCharacterFromStorage } from '../characterPersistence';

// ─── Local type definitions ────────────────────────────────────────────────────
// These types are used only within this slice and not exported — they represent
// the internal shape of scores as stored in Redux (slightly flatter than NormedScore).

/** A single subscore as stored in Redux state — just the ID, title, and numeric value. */
interface LocalSubscore {
  _id: string,
  title: string | null,
  value: number | null
};

/**
 * A single score (e.g. Physical, Psyche) as stored in Redux state.
 * Contains the score's subscores and its computed average value.
 */
interface Score {
  _id: string,
  title: string | null,
  subscores: {
    _id: string,
    title: string | null,
    value: number | null
  }[],
  value: number | null  // Average of all subscores; null until initialized
};

/**
 * Payload for updating a single subscore value.
 * Requires both the subscore's own ID and its parent score's ID so the
 * correct score's average can be recalculated after the update.
 */
interface SubscoreUpdate {
  _id: string,       // The subscore being changed
  parent_id: string, // The score that contains this subscore
  value: number,
};

/** An animal companion the character has chosen. */
interface AnimalCompanion {
  id: string,
  name: string,
  details: string
};

/** The four currency types in Atom Magic. */
interface Wealth {
  silver: number,
  gold: number,
  lead: number,
  uranium: number
};

// ─── State shape ───────────────────────────────────────────────────────────────

/**
 * The complete Redux state for the character currently being edited.
 *
 * String fields (culture, path, patronage, disciplines, techniques) store
 * Payload CMS document IDs (as strings). The actual document data is fetched
 * separately via fetchCharacterData.ts and passed as props where needed.
 */
export interface CharacterState {
  /** True once scores have been initialized from CMS data via initScore. */
  loaded: boolean,
  name: string,
  age: number,
  pronouns: string,
  description: string,
  /** Payload document ID of the chosen culture (e.g. Spiranos, Boreanos). */
  culture: string,
  /** Payload document ID of the chosen path (Theurgist, Iconoclast, Autodidact). */
  path: string,
  /** Payload document ID of the chosen patronage (which Cardinal the character follows). */
  patronage: string,
  /** Total points available to distribute across subscores (set by path selection). */
  scorePoints: number,
  /** The four core scores (Physical, Interpersonal, Intellect, Psyche), each with subscores. */
  scores: Array<Score>,
  /** Derived stats (Shield, Reputation, etc.) calculated from subscores via formulas. */
  additionalScores: NormedAdditionalScore[],
  /** Payload document IDs of chosen disciplines (e.g. Thermal, Kinetic). */
  disciplines: Array<string>,
  /** Payload document IDs of chosen techniques. */
  techniques: Array<string>,
  /** The character's equipped gear (weapons, armor, enhancements from gear-data.ts). */
  gear: CharacterGearItem[],
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

// ─── Initial state ─────────────────────────────────────────────────────────────

/**
 * Blank character state — the starting point before any user input.
 * `loaded` is false until `initScore` is called with CMS score data.
 * Scores and additionalScores start empty and are populated from the CMS.
 */
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

// ─── Slice ─────────────────────────────────────────────────────────────────────

export const characterSlice = createSlice({
  name: 'character',
  initialState,
  reducers: {

    /**
     * Initializes the scores array from CMS data.
     *
     * Should be called once when the character page loads, passing in the
     * normalized score documents from fetchCharacterData.ts. Does nothing
     * if scores are already populated (to avoid overwriting a loaded character).
     *
     * For each score it:
     *   - Converts subscores to the local format
     *   - Computes the initial score value as the average of subscore default values
     *   - Pushes the result into state.scores
     *
     * Sets `loaded = true` once complete, signaling that the character form is ready.
     */
    initScore: (state, action: PayloadAction<NormedScore[]>) => {
      if (state.scores.length === 0) {
        let subs: LocalSubscore[];
        let scoreAverage: number;
        let subscoreCount: number;
        action.payload.forEach((score: NormedScore) => {
          subs = [];
          scoreAverage = 0;
          subscoreCount = 0;
          if (score.subscores) {
            score.subscores.map((s) => {
              s.defaultValue ? scoreAverage += s.defaultValue : scoreAverage;
              subscoreCount++;
              subs.push({
                _id: s._id,
                title: s.title,
                value: s.defaultValue ?? null
              });
            });
          }
          scoreAverage = Math.round(scoreAverage / subscoreCount);
          state.scores.push({
            _id: score._id,
            title: score.title,
            subscores: subs,
            value: scoreAverage
          });
        });
        state.loaded = true;
      }
    },

    /**
     * Initializes the additionalScores array from CMS data.
     *
     * Called once on page load alongside initScore. Does nothing if already
     * populated. The additional scores start with their `value` field as null;
     * call `setAdditionalScores` to calculate their initial values.
     */
    initAdditionalScores: (state, action: PayloadAction<NormedAdditionalScore[]>) => {
      if (state.additionalScores.length === 0) {
        state.additionalScores = action.payload;
      }
    },

    /**
     * Recalculates all additional scores (derived stats) from the current subscores.
     *
     * Each additional score in the CMS has a `calculation` field (sum, difference,
     * multiply, divide) and a list of `scores` referencing specific subscores.
     * It may also have `additionalCalculations` — flat adjustments applied after
     * the main formula (e.g. "add 2 to the result").
     *
     * This should be called any time a subscore changes, after setSubscore,
     * so derived stats (like Shield) stay in sync with score changes.
     *
     * Example: Physical Shield might be defined as "sum of Endurance + Stamina + 3"
     */
    setAdditionalScores: (state) => {
      let updatedAdditionalScores = state.additionalScores;
      updatedAdditionalScores.forEach((as) => {
        let newScore = 0;
        let subscores: number[] = [];

        // Collect the current values of all the subscores this derived stat depends on
        if (as.scores !== null) {
          as.scores.forEach((s) => {
            let found: number | null = 0;
            state.scores.find((ts) => {
              ts.subscores.forEach(ss => {
                if (ss._id === s._id) {
                  found = ss.value;
                }
              });
            });
            subscores.push(found);
          });
        }

        // Apply the main formula across all collected subscore values
        switch (as.calculation) {
          case "sum":
            subscores.forEach(s => { newScore += s; });
            break;
          case "difference":
            subscores.forEach(s => { newScore -= s; });
            break;
          case "multiply":
            subscores.forEach(s => { newScore *= s; });
            break;
          case "divide":
            subscores.forEach(s => { newScore = newScore / s; });
            break;
          default: break;
        }

        // Apply any flat adjustments defined on the additional score in the CMS
        if (as.additionalCalculations) {
          as.additionalCalculations.forEach(ac => {
            if (ac.value) {
              switch (ac.calculationType) {
                case "sum":      newScore += ac.value;      break;
                case "difference": newScore -= ac.value;   break;
                case "multiply": newScore *= ac.value;     break;
                case "divide":   newScore = newScore / ac.value; break;
                default: break;
              }
            }
          });
        }

        as.value = Math.round(newScore);
      });
      state.additionalScores = updatedAdditionalScores;
    },

    /**
     * Sets the total score points available to the character.
     * Score points are assigned by the chosen path (Theurgist, Iconoclast, Autodidact).
     */
    setScorePoints: (state, action: PayloadAction<number>) => {
      state.scorePoints = action.payload;
    },

    /**
     * Updates a single subscore value and recalculates its parent score's average.
     *
     * The score value (e.g. "Physical = 12") is always the average of its subscores.
     * After any subscore changes, the parent score's value is recalculated here
     * by summing all subscore values and dividing by the count.
     *
     * Note: this does NOT call setAdditionalScores — callers must dispatch that
     * separately if they want derived stats to update at the same time.
     */
    setSubscore: (state, action: PayloadAction<SubscoreUpdate>) => {
      const updatedScores = state.scores.map((score: Score) => {
        if (score._id === action.payload.parent_id) {
          let total = 0;
          score.subscores.map((sub) => {
            if (sub._id === action.payload._id) {
              sub.value = action.payload.value;
              sub.value !== null ? total += action.payload.value : undefined;
            } else {
              sub.value !== null ? total += sub.value : undefined;
            }
            return sub;
          });
          score.subscores.length > 0 ? total = total / score.subscores.length : total;
          score.value = Math.round(total);
        }
        return score;
      });
      state.scores = updatedScores;
    },

    /** Sets the list of chosen discipline IDs (Payload document IDs as strings). */
    setDisciplines: (state, action: PayloadAction<string[]>) => {
      state.disciplines = action.payload;
    },

    /** Sets the list of chosen technique IDs (Payload document IDs as strings). */
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

    /** Sets the chosen culture by its Payload document ID string. */
    setCulture: (state, action: PayloadAction<string>) => {
      state.culture = action.payload;
    },

    /** Sets the chosen path by its Payload document ID string. */
    setPath: (state, action: PayloadAction<string>) => {
      state.path = action.payload;
    },

    /** Sets the chosen patronage by its Payload document ID string. */
    setPatronage: (state, action: PayloadAction<string>) => {
      state.patronage = action.payload;
    },

    /**
     * Replaces the character's gear list.
     * Gear items come from gear-data.ts (local data, not the CMS).
     * Each CharacterGearItem has a type ("weapon", "armor", or "enhancement"),
     * the item's local ID, and the item's resolved data.
     */
    setGear: (state, action: PayloadAction<CharacterGearItem[]>) => {
      state.gear = action.payload;
    },

    /** Replaces all four currency values at once. */
    setWealth: (state, action: PayloadAction<Wealth>) => {
      state.wealth.silver = action.payload.silver;
      state.wealth.gold = action.payload.gold;
      state.wealth.lead = action.payload.lead;
      state.wealth.uranium = action.payload.uranium;
    },

    /** Sets the character's animal companion (ID, name, and description). */
    setAnimalCompanion: (state, action: PayloadAction<AnimalCompanion>) => {
      state.animalCompanion.name = action.payload.name;
      state.animalCompanion.id = action.payload.id;
      state.animalCompanion.details = action.payload.details;
    },

    /**
     * Replaces the entire character state with a previously saved character.
     * Used when loading a character from the roster (localStorage) or from
     * a shared URL. Always sets `loaded: true` on the loaded character.
     */
    loadCharacter: (state, action: PayloadAction<CharacterState>) => {
      return { ...action.payload, loaded: true };
    },

    /**
     * Resets the character to a blank state and removes it from localStorage.
     * Used when the user explicitly starts a new character or clears the current one.
     */
    clearCharacter: () => {
      clearCharacterFromStorage();
      return { ...initialState };
    },

    /**
     * Saves the current character state to localStorage.
     * This is called by the Sections.tsx component when meaningful fields change.
     * The actual save logic lives in characterPersistence.ts.
     */
    saveCharacter: (state) => {
      saveCharacterToStorage(state);
    },
  }
})

export const {
  initScore,
  initAdditionalScores,
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
  setWealth,
  setAnimalCompanion,
  loadCharacter,
  clearCharacter,
  saveCharacter
} = characterSlice.actions

/** Selector to read the character's name from the Redux store. */
export const characterName = (state: RootState) => state.character.name

export default characterSlice.reducer
