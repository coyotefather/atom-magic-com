/**
 * customCreaturePersistence.ts
 *
 * Functions for saving, loading, and managing custom creatures in localStorage
 * and in downloadable .creatura files.
 *
 * This is the persistence layer for the Creature Manager feature. It is
 * structurally parallel to `characterPersistence.ts` — the patterns are the same,
 * just applied to custom creatures instead of player characters.
 *
 * Storage architecture:
 *   - Roster index: `atom-magic-custom-creatures`
 *     A summary list of all custom creatures with lightweight display data
 *     (name, challenge level, health, counts). Used to populate the roster sidebar
 *     without loading every creature's full state.
 *   - Individual creatures: `atom-magic-custom-creature-{uuid}`
 *     The full `CustomCreatureState` for each creature, stored separately.
 *   - Active creature: tracked by `activeCreatureId` in the roster index.
 *     The active creature auto-loads when the Creature Manager opens.
 *
 * Unlike the character system, there is NO legacy single-character migration —
 * custom creatures were always multi-creature from the start.
 *
 * File import/export:
 *   Custom creatures can be exported to `.creatura` files and imported back.
 *   The format is a versioned JSON wrapper: `{ version, exportedAt, creature }`.
 *   The current version is 1.
 *
 * Auto-save:
 *   The `CustomCreatureEditor.tsx` component calls `saveCreatureById()` automatically
 *   via a debounced useEffect whenever the Redux creature state changes. This file
 *   provides the save function; the component manages when to call it.
 *
 * All functions guard against SSR with `typeof window === 'undefined'` checks.
 *
 * Used by:
 *   - `src/app/components/creatures/CreatureManager.tsx` (loads roster, selects creature)
 *   - `src/app/components/creatures/CustomCreatureEditor.tsx` (auto-saves on change)
 *   - `src/app/components/creatures/CustomCreatureRoster.tsx` (displays and manages roster)
 */

import { CustomCreatureState } from './slices/customCreatureSlice';

// ─── Storage keys ──────────────────────────────────────────────────────────────
// These keys must remain stable — changing them would lose all existing custom creatures.

/** Key for the custom creature roster index. */
const ROSTER_KEY = 'atom-magic-custom-creatures';

/** Prefix for individual creature stores. Full key = prefix + UUID. */
const CREATURE_PREFIX = 'atom-magic-custom-creature-';

/** File extension for exported creature files. */
const FILE_EXTENSION = '.creatura';

/** Current file format version. Increment for breaking schema changes. */
const FILE_VERSION = 1;

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * A lightweight summary of a custom creature shown in the Creature Manager sidebar.
 * Stored as part of the roster index — not the full creature state.
 */
export interface CustomCreatureSummary {
	id: string;              // UUID identifying this creature's localStorage entry
	name: string;
	challengeLevel: string;  // harmless/trivial/easy/moderate/hard/deadly
	creatureType: string;    // e.g., "Beast", "Construct"
	health: number;
	attackCount: number;
	abilityCount: number;
	lastModified: string;    // ISO timestamp
}

/**
 * The roster index stored in localStorage.
 * `activeCreatureId` is the UUID of the creature that auto-loads when the
 * Creature Manager opens. Null means no creature is auto-selected.
 */
export interface CustomCreatureRoster {
	activeCreatureId: string | null;
	creatures: CustomCreatureSummary[];
}

/** The versioned wrapper format for .creatura files. */
interface CreatureFile {
	version: number;
	exportedAt: string;
	creature: CustomCreatureState;
}

/** Returns a fresh empty roster object (used as a safe default). */
const createEmptyRoster = (): CustomCreatureRoster => ({
	activeCreatureId: null,
	creatures: [],
});

// ─── Roster functions ──────────────────────────────────────────────────────────

/**
 * Reads the creature roster index from localStorage.
 * Returns an empty roster if nothing is stored or on parse error.
 */
export const getCreatureRoster = (): CustomCreatureRoster => {
	if (typeof window === 'undefined') {
		return createEmptyRoster();
	}

	try {
		const serialized = localStorage.getItem(ROSTER_KEY);
		if (!serialized) {
			return createEmptyRoster();
		}
		return JSON.parse(serialized) as CustomCreatureRoster;
	} catch (err) {
		console.error('Failed to load creature roster from localStorage:', err);
		return createEmptyRoster();
	}
};

/** Writes the creature roster index to localStorage. */
export const saveCreatureRoster = (roster: CustomCreatureRoster): void => {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
	} catch (err) {
		console.error('Failed to save creature roster to localStorage:', err);
	}
};

/**
 * Loads the full creature state for a specific creature by its UUID.
 * Returns null if no creature is stored with that ID.
 */
export const getCreatureById = (id: string): CustomCreatureState | null => {
	if (typeof window === 'undefined') return null;

	try {
		const serialized = localStorage.getItem(CREATURE_PREFIX + id);
		if (!serialized) return null;
		return JSON.parse(serialized) as CustomCreatureState;
	} catch (err) {
		console.error('Failed to load creature from localStorage:', err);
		return null;
	}
};

/**
 * Saves the full creature state AND updates the roster index with a fresh summary.
 *
 * Called automatically by `CustomCreatureEditor.tsx` on a debounced 1-second
 * timer whenever the Redux creature state changes (auto-save on edit).
 *
 * The summary is computed fresh from the creature state on every save —
 * no separate "update summary" step is needed.
 */
export const saveCreatureById = (id: string, creature: CustomCreatureState): void => {
	if (typeof window === 'undefined') return;

	try {
		// Save the full creature state under its UUID key
		localStorage.setItem(CREATURE_PREFIX + id, JSON.stringify(creature));

		// Derive the roster summary from the current state and update the index
		const roster = getCreatureRoster();
		const summaryIndex = roster.creatures.findIndex((c) => c.id === id);
		const summary: CustomCreatureSummary = {
			id,
			name: creature.name || 'Unnamed Creature',
			challengeLevel: creature.challengeLevel,
			creatureType: creature.creatureType,
			health: creature.health,
			attackCount: creature.attacks.length,
			abilityCount: creature.specialAbilities.length,
			lastModified: new Date().toISOString(),
		};

		if (summaryIndex >= 0) {
			roster.creatures[summaryIndex] = summary;  // Update existing entry
		} else {
			roster.creatures.push(summary);  // New creature — append to roster
		}

		saveCreatureRoster(roster);
	} catch (err) {
		console.error('Failed to save creature to localStorage:', err);
	}
};

/**
 * Deletes a creature's full state and removes it from the roster index.
 * If the deleted creature was the active one, clears the active creature ID.
 */
export const deleteCreatureById = (id: string): void => {
	if (typeof window === 'undefined') return;

	try {
		localStorage.removeItem(CREATURE_PREFIX + id);

		const roster = getCreatureRoster();
		roster.creatures = roster.creatures.filter((c) => c.id !== id);

		if (roster.activeCreatureId === id) {
			roster.activeCreatureId = null;
		}

		saveCreatureRoster(roster);
	} catch (err) {
		console.error('Failed to delete creature from localStorage:', err);
	}
};

/**
 * Sets which creature is "active" — the one that auto-loads when the Creature
 * Manager opens. Pass `null` to clear the active creature.
 */
export const setActiveCreature = (id: string | null): void => {
	if (typeof window === 'undefined') return;

	try {
		const roster = getCreatureRoster();
		roster.activeCreatureId = id;
		saveCreatureRoster(roster);
	} catch (err) {
		console.error('Failed to set active creature:', err);
	}
};

/** Generates a new UUID for a fresh custom creature. */
export const createNewCreatureId = (): string => {
	return crypto.randomUUID();
};

// ─── File import / export ──────────────────────────────────────────────────────

/**
 * Triggers a browser download of the creature as a `.creatura` file.
 *
 * The file contains the full creature state wrapped in a versioned envelope
 * `{ version, exportedAt, creature }`. The filename is derived from the
 * creature's name (sanitized to be filesystem-safe).
 *
 * @throws Error if the download mechanism fails
 */
export const exportCreatureToFile = (creature: CustomCreatureState): void => {
	if (typeof window === 'undefined') return;

	try {
		const fileData: CreatureFile = {
			version: FILE_VERSION,
			exportedAt: new Date().toISOString(),
			creature,
		};

		const blob = new Blob([JSON.stringify(fileData, null, 2)], {
			type: 'application/json',
		});

		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');

		// Sanitize the creature name for use as a filesystem-safe filename
		const fileName = creature.name
			? creature.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
			: 'creature';

		link.href = url;
		link.download = `${fileName}${FILE_EXTENSION}`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	} catch (err) {
		console.error('Failed to export creature to file:', err);
		throw new Error('Failed to export creature');
	}
};

/**
 * Reads a `.creatura` file selected by the user and returns the creature state.
 *
 * Handles two formats:
 *   - Wrapped format: `{ version, exportedAt, creature }` — current format
 *   - Raw format: plain CustomCreatureState — for backwards compatibility
 *
 * @param file - The File object from a file input or drag-and-drop event
 * @returns Promise resolving to the parsed CustomCreatureState, or rejecting with Error
 */
export const importCreatureFromFile = (file: File): Promise<CustomCreatureState> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (event) => {
			try {
				const content = event.target?.result as string;
				const parsed = JSON.parse(content);

				let creature: CustomCreatureState;

				if (parsed.version && parsed.creature) {
					// Current versioned format
					const fileData = parsed as CreatureFile;

					if (fileData.version > FILE_VERSION) {
						reject(new Error('This file was created with a newer version of Atom Magic. Please update to load it.'));
						return;
					}

					creature = fileData.creature;
				} else if (parsed.name !== undefined && parsed.attacks !== undefined) {
					// Legacy raw format (pre-versioning) — name and attacks are minimum identifiers
					creature = parsed as CustomCreatureState;
				} else {
					reject(new Error('Invalid creature file format'));
					return;
				}

				if (typeof creature.name !== 'string') {
					reject(new Error('Invalid creature data: missing name'));
					return;
				}

				resolve(creature);
			} catch {
				reject(new Error('Failed to parse creature file. The file may be corrupted.'));
			}
		};

		reader.onerror = () => {
			reject(new Error('Failed to read file'));
		};

		reader.readAsText(file);
	});
};

/** Returns the file extension used for exported creature files (`.creatura`). */
export const getCreatureFileExtension = (): string => FILE_EXTENSION;
