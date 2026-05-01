/**
 * customCreatureSlice.ts
 *
 * Redux Toolkit slice managing the state of the creature currently being
 * edited in the Creature Manager.
 *
 * The Creature Manager (src/app/components/creatures/CreatureManager.tsx) lets
 * GMs create and edit custom creatures — either built from scratch or cloned
 * from an existing CMS creature. This slice holds the working state of
 * whichever creature is currently open in the editor.
 *
 * Relationship to persistence:
 *   This slice only holds the in-memory editor state. Saving to localStorage
 *   (the creature roster) is handled separately by customCreaturePersistence.ts.
 *   The editor component (CustomCreatureEditor.tsx) auto-saves to localStorage
 *   via a debounced effect whenever this slice state changes — it does NOT
 *   use a Redux action for saving (unlike the character slice's saveCharacter).
 *
 * Cloning from CMS creatures:
 *   When a user picks an existing CMS creature as a starting point, the
 *   `basedOnId` and `basedOnName` fields record the origin. This is purely
 *   informational — the custom creature is fully independent once created.
 *
 * Lists (attacks, specialAbilities):
 *   These use UUID-keyed items rather than array indices to avoid positional
 *   bugs when items are added/removed. Each item has its own stable `id`.
 *
 * Consumed by:
 *   - src/app/components/creatures/CustomCreatureEditor.tsx
 *   - src/app/components/creatures/CreatureManager.tsx
 *   - src/lib/customCreaturePersistence.ts (reads state shape for storage format)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// ─── Local type definitions ────────────────────────────────────────────────────

/**
 * A single attack entry on a creature (e.g. "Claw — 2d6 + 3").
 * The `id` is a UUID used for stable keying in the React list.
 */
interface Attack {
  id: string;
  name: string;
  damage: string;  // Free-text damage expression, e.g. "2d6 + 3" or "1d10"
}

/**
 * A named special ability with a description (e.g. "Poison Sting — On hit, target makes a Physique save").
 * The `id` is a UUID used for stable keying in the React list.
 */
interface SpecialAbility {
  id: string;
  name: string;
  description: string;
}

// ─── State shape ───────────────────────────────────────────────────────────────

/**
 * The full Redux state for the creature currently being edited.
 *
 * Scores (physical, interpersonal, intellect, psyche) default to 10,
 * matching the CMS creature baseline. Combat stats (shields, health, armor)
 * start at 0 and are set explicitly by the GM.
 *
 * Challenge levels map to difficulty labels used in the Encounter Builder:
 *   harmless → trivial → easy → moderate → hard → deadly
 */
export interface CustomCreatureState {
  /** True once a creature has been loaded into the editor (via loadCreature). */
  loaded: boolean;
  /** Unique ID for this custom creature (UUID, assigned by the roster on first save). */
  id: string;
  name: string;
  /** Short description shown in the creature roller cards (1-2 sentences). */
  description: string;

  // ─── Core Scores (same four as player characters) ──────────────────────────
  physical: number;
  interpersonal: number;
  intellect: number;
  psyche: number;

  // ─── Combat stats ──────────────────────────────────────────────────────────
  health: number;
  physicalShield: number;
  psychicShield: number;
  armorCapacity: number;

  // ─── Abilities and attacks ─────────────────────────────────────────────────
  attacks: Attack[];
  specialAbilities: SpecialAbility[];

  // ─── Classification tags ───────────────────────────────────────────────────
  /** One of: harmless, trivial, easy, moderate, hard, deadly */
  challengeLevel: string;
  /** Free-text category, e.g. "Beast", "Construct", "Humanoid" */
  creatureType: string;
  /** Habitats where this creature is found, e.g. ["Forest", "Mountains"] */
  environments: string[];
  /** True if this creature fights as a group/swarm rather than individually. */
  isSwarm: boolean;
  /** True if this is a named individual (boss/villain) rather than a generic creature type. */
  isUnique: boolean;

  // ─── Origin tracking (for clones from the CMS) ─────────────────────────────
  /** Payload CMS document ID of the creature this was cloned from, or null if built from scratch. */
  basedOnId: string | null;
  /** Name of the CMS creature this was cloned from (for display purposes). */
  basedOnName: string | null;

  // ─── Meta ──────────────────────────────────────────────────────────────────
  /** ISO timestamp of last edit. Set by customCreaturePersistence.ts on save. */
  lastModified: string;
}

// ─── Initial state ─────────────────────────────────────────────────────────────

/**
 * A blank creature — used when creating a new creature from scratch.
 * All scores default to 10 (the baseline in the game system).
 * `loaded` starts false until loadCreature is dispatched.
 */
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

// ─── Slice ─────────────────────────────────────────────────────────────────────

export const customCreatureSlice = createSlice({
  name: 'customCreature',
  initialState,
  reducers: {

    /**
     * Loads an existing creature (from the roster or a CMS clone) into the editor.
     * Replaces all state with the provided creature and sets `loaded: true`.
     * Called by CreatureManager.tsx when the user selects a creature from the roster.
     */
    loadCreature: (_state, action: PayloadAction<CustomCreatureState>) => {
      return { ...action.payload, loaded: true };
    },

    /**
     * Resets the editor to a blank creature.
     * Called when the user clicks "New Creature" in the roster panel.
     * Does NOT clear localStorage — roster management is separate.
     */
    clearCreature: () => {
      return { ...initialState };
    },

    setCreatureName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },

    setCreatureDescription: (state, action: PayloadAction<string>) => {
      state.description = action.payload;
    },

    /**
     * Sets one of the four core score values.
     * Uses a single generic action to avoid four near-identical reducers.
     * @param field - Which score to update ('physical' | 'interpersonal' | 'intellect' | 'psyche')
     * @param value - The new numeric value
     */
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

    /** Replaces the full environments list. Pass the updated array rather than appending. */
    setCreatureEnvironments: (state, action: PayloadAction<string[]>) => {
      state.environments = action.payload;
    },

    setCreatureIsSwarm: (state, action: PayloadAction<boolean>) => {
      state.isSwarm = action.payload;
    },

    setCreatureIsUnique: (state, action: PayloadAction<boolean>) => {
      state.isUnique = action.payload;
    },

    // ─── Attack list management ───────────────────────────────────────────────

    /**
     * Adds a new blank attack entry to the list.
     * A UUID is assigned immediately so React can use it as a stable list key.
     */
    addAttack: (state) => {
      state.attacks.push({
        id: crypto.randomUUID(),
        name: '',
        damage: '',
      });
    },

    /**
     * Updates a single field on an existing attack.
     * Finds the attack by its UUID rather than index to safely handle list mutations.
     */
    updateAttack: (state, action: PayloadAction<{ id: string; field: 'name' | 'damage'; value: string }>) => {
      const attack = state.attacks.find(a => a.id === action.payload.id);
      if (attack) {
        attack[action.payload.field] = action.payload.value;
      }
    },

    /** Removes an attack by its UUID. */
    removeAttack: (state, action: PayloadAction<string>) => {
      state.attacks = state.attacks.filter(a => a.id !== action.payload);
    },

    // ─── Special ability list management ─────────────────────────────────────

    /**
     * Adds a new blank special ability.
     * A UUID is assigned immediately for stable React keying.
     */
    addSpecialAbility: (state) => {
      state.specialAbilities.push({
        id: crypto.randomUUID(),
        name: '',
        description: '',
      });
    },

    /**
     * Updates a single field on an existing special ability.
     * Finds by UUID for safety during list mutations.
     */
    updateSpecialAbility: (state, action: PayloadAction<{ id: string; field: 'name' | 'description'; value: string }>) => {
      const ability = state.specialAbilities.find(a => a.id === action.payload.id);
      if (ability) {
        ability[action.payload.field] = action.payload.value;
      }
    },

    /** Removes a special ability by its UUID. */
    removeSpecialAbility: (state, action: PayloadAction<string>) => {
      state.specialAbilities = state.specialAbilities.filter(a => a.id !== action.payload);
    },

    /**
     * Records that this custom creature was cloned from a CMS creature.
     * Pass null for both fields when creating from scratch.
     * This information is shown in the editor UI so the GM knows the origin,
     * but has no effect on how the creature behaves in the game.
     */
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

/** Selector to read the full custom creature editor state from the Redux store. */
export const selectCustomCreature = (state: RootState) => state.customCreature

export default customCreatureSlice.reducer
