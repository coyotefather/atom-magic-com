/**
 * characterPersistence.ts
 *
 * Functions for saving, loading, and managing characters in localStorage and
 * in downloadable .persona files.
 *
 * Storage architecture — two separate systems:
 *
 *   1. Multi-character roster (primary):
 *      - One roster document stored at `atom-magic-roster` — an index of all
 *        characters with summary data (name, stats, lastModified, etc.)
 *      - Each character's full state stored separately at `atom-magic-character-{uuid}`
 *      - The roster tracks which character is "active" (auto-loaded on next visit)
 *      - This system was added to support multiple characters per user
 *
 *   2. Legacy single-character storage (secondary, for migration only):
 *      - Stored at `atom-magic-character` (no UUID suffix)
 *      - Used by the original single-character version of the app
 *      - `migrateToMultiCharacter()` moves a legacy save into the roster format
 *        automatically on first load; see `useCharacterPersistence.ts` for the flow
 *
 * File import/export:
 *   Characters can also be exported to `.persona` files and imported back.
 *   The file format is a versioned JSON wrapper `{ version, exportedAt, character }`.
 *   The current version is 1. If a future version adds breaking changes, the importer
 *   can handle the version mismatch gracefully.
 *
 * All functions guard against SSR (server-side rendering) with
 * `typeof window === 'undefined'` checks — `localStorage` is not available
 * on the server.
 *
 * Used by:
 *   - `src/lib/hooks/useCharacterPersistence.ts` (the primary consumer)
 *   - Character share/export UI components
 */

import { CharacterState } from './slices/characterSlice';

// ─── Storage keys ──────────────────────────────────────────────────────────────
// These keys must remain stable — changing them would lose all existing saves.

/** Legacy single-character storage key (pre-roster era). */
const STORAGE_KEY = 'atom-magic-character';

/** Key for the roster index (contains summaries + active character ID). */
const ROSTER_KEY = 'atom-magic-roster';

/** Prefix for individual character stores. Full key = prefix + UUID. */
const CHARACTER_PREFIX = 'atom-magic-character-';

/** File extension for exported character files. */
const FILE_EXTENSION = '.persona';

/** Current file format version. Increment when the schema changes in a breaking way. */
const FILE_VERSION = 1;

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * A lightweight summary of a character shown in the Character Roster sidebar.
 * Stored as part of the roster index — not the full character state.
 * Derived from the full character state whenever the character is saved.
 */
export interface CharacterSummary {
	id: string;             // UUID identifying this character's localStorage entry
	name: string;
	culture: string;        // Payload culture ID
	path: string;           // Payload path ID
	patronage: string;      // Payload patronage ID
	physicalShield: number; // Computed: physical score average + gear bonuses
	psychicShield: number;  // Computed: psyche score average + gear bonuses
	armorCapacity: number;  // From equipped armor
	disciplineCount: number;
	techniqueCount: number;
	isComplete: boolean;    // True if all required fields are filled
	lastModified: string;   // ISO timestamp
}

/**
 * The roster index stored in localStorage.
 * `activeCharacterId` is the UUID of the character that auto-loads on the next visit.
 * A null `activeCharacterId` means the user hasn't selected a character to resume.
 */
export interface CharacterRoster {
	activeCharacterId: string | null;
	characters: CharacterSummary[];
}

// ─── Legacy single-character storage ──────────────────────────────────────────
// These functions access the old `atom-magic-character` key.
// Only used during migration and for backwards compatibility.

/** Saves a character to the legacy single-character key. Used during migration. */
export const saveCharacterToStorage = (character: CharacterState): void => {
	if (typeof window === 'undefined') return;

	try {
		const serialized = JSON.stringify(character);
		localStorage.setItem(STORAGE_KEY, serialized);
	} catch (err) {
		console.error('Failed to save character to localStorage:', err);
	}
};

/** Loads a character from the legacy single-character key. */
export const loadCharacterFromStorage = (): CharacterState | null => {
	if (typeof window === 'undefined') return null;

	try {
		const serialized = localStorage.getItem(STORAGE_KEY);
		if (!serialized) return null;
		return JSON.parse(serialized) as CharacterState;
	} catch (err) {
		console.error('Failed to load character from localStorage:', err);
		return null;
	}
};

/** Removes the legacy single-character entry from localStorage. */
export const clearCharacterFromStorage = (): void => {
	if (typeof window === 'undefined') return;

	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch (err) {
		console.error('Failed to clear character from localStorage:', err);
	}
};

/** Returns true if a legacy single-character save exists. Used to detect migration need. */
export const hasStoredCharacter = (): boolean => {
	if (typeof window === 'undefined') return false;

	try {
		return localStorage.getItem(STORAGE_KEY) !== null;
	} catch {
		return false;
	}
};

// ─── Multi-character roster ────────────────────────────────────────────────────

/**
 * Reads the roster index from localStorage.
 * Returns an empty roster if nothing is stored or if there's a parse error.
 */
export const getRoster = (): CharacterRoster => {
	if (typeof window === 'undefined') {
		return { activeCharacterId: null, characters: [] };
	}

	try {
		const serialized = localStorage.getItem(ROSTER_KEY);
		if (!serialized) {
			return { activeCharacterId: null, characters: [] };
		}
		return JSON.parse(serialized) as CharacterRoster;
	} catch (err) {
		console.error('Failed to load roster from localStorage:', err);
		return { activeCharacterId: null, characters: [] };
	}
};

/** Writes the roster index to localStorage. */
export const saveRoster = (roster: CharacterRoster): void => {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
	} catch (err) {
		console.error('Failed to save roster to localStorage:', err);
	}
};

/**
 * Loads the full character state for a specific character by its UUID.
 * Returns null if no character is stored with that ID.
 */
export const getCharacterById = (id: string): CharacterState | null => {
	if (typeof window === 'undefined') return null;

	try {
		const serialized = localStorage.getItem(CHARACTER_PREFIX + id);
		if (!serialized) return null;
		return JSON.parse(serialized) as CharacterState;
	} catch (err) {
		console.error('Failed to load character from localStorage:', err);
		return null;
	}
};

/**
 * Saves the full character state AND updates the roster index with a fresh summary.
 *
 * The summary (shield values, completion status, etc.) is computed fresh from the
 * full character state every time the character is saved. This keeps the roster
 * sidebar accurate without needing to store derived data in two places.
 *
 * @param id - The UUID of the character to save
 * @param character - The full Redux character state to persist
 */
export const saveCharacterById = (id: string, character: CharacterState): void => {
	if (typeof window === 'undefined') return;

	try {
		// Save the full character state under its UUID key
		localStorage.setItem(CHARACTER_PREFIX + id, JSON.stringify(character));

		// ─── Compute summary fields ────────────────────────────────────────────────
		// The roster summary stores pre-computed values so the roster sidebar can
		// render without loading every character's full state.

		// Compute Physical Shield: average Physical score + gear bonuses
		const physicalScore = character.scores.find(s => s.title === 'Physical');
		const psycheScore = character.scores.find(s => s.title === 'Psyche');
		const physicalAvg = physicalScore?.subscores?.length
			? Math.round(physicalScore.subscores.reduce((sum, sub) => sum + (sub.value || 0), 0) / physicalScore.subscores.length)
			: 0;
		const psycheAvg = psycheScore?.subscores?.length
			? Math.round(psycheScore.subscores.reduce((sum, sub) => sum + (sub.value || 0), 0) / psycheScore.subscores.length)
			: 0;

		// Find equipped armor and its enhancement (armor can have one enhancement attached)
		const armor = character.gear.find(g => g.type === 'armor');
		const enhancement = armor?.enhancement;
		const physicalShieldBonus = (armor?.physicalShieldBonus || 0) + (enhancement?.physicalShieldBonus || 0);
		const psychicShieldBonus = (armor?.psychicShieldBonus || 0) + (enhancement?.psychicShieldBonus || 0);

		// A character is "complete" if all required creation sections are filled
		const isComplete = Boolean(
			character.name &&
			character.culture &&
			character.path &&
			character.patronage &&
			character.disciplines.length > 0 &&
			character.gear.length > 0 &&
			character.wealth.silver > 0
		);

		// Update (or add) this character's summary in the roster index
		const roster = getRoster();
		const summaryIndex = roster.characters.findIndex((c) => c.id === id);
		const summary: CharacterSummary = {
			id,
			name: character.name || 'Unnamed',
			culture: character.culture || '',
			path: character.path || '',
			patronage: character.patronage || '',
			physicalShield: physicalAvg + physicalShieldBonus,
			psychicShield: psycheAvg + psychicShieldBonus,
			armorCapacity: armor?.capacity || 0,
			disciplineCount: character.disciplines.length,
			techniqueCount: character.techniques.length,
			isComplete,
			lastModified: new Date().toISOString(),
		};

		if (summaryIndex >= 0) {
			roster.characters[summaryIndex] = summary;  // Update existing entry
		} else {
			roster.characters.push(summary);  // New character — append to roster
		}

		saveRoster(roster);
	} catch (err) {
		console.error('Failed to save character to localStorage:', err);
	}
};

/**
 * Deletes a character's full state from localStorage and removes it from the roster.
 * If the deleted character was the active one, clears the active character ID.
 */
export const deleteCharacterById = (id: string): void => {
	if (typeof window === 'undefined') return;

	try {
		localStorage.removeItem(CHARACTER_PREFIX + id);

		const roster = getRoster();
		roster.characters = roster.characters.filter((c) => c.id !== id);

		if (roster.activeCharacterId === id) {
			roster.activeCharacterId = null;
		}

		saveRoster(roster);
	} catch (err) {
		console.error('Failed to delete character from localStorage:', err);
	}
};

/**
 * Sets which character is "active" — the one that auto-loads when the user
 * returns to the Character Manager. Pass `null` to clear the active character.
 */
export const setActiveCharacter = (id: string | null): void => {
	if (typeof window === 'undefined') return;

	try {
		const roster = getRoster();
		roster.activeCharacterId = id;
		saveRoster(roster);
	} catch (err) {
		console.error('Failed to set active character:', err);
	}
};

/** Generates a new UUID for a fresh character. */
export const createNewCharacterId = (): string => {
	return crypto.randomUUID();
};

/**
 * Migrates a legacy single-character save (from the pre-roster era) into the
 * multi-character roster format.
 *
 * Safe to call on every app load — it checks if the roster already has characters
 * and bails out immediately if migration has already happened or is unnecessary.
 *
 * Migration process:
 *   1. Read the legacy `atom-magic-character` key
 *   2. If it exists and has a name, assign it a new UUID
 *   3. Save it to `atom-magic-character-{uuid}` in the new format
 *   4. Set it as the active character in the roster
 *   5. The old key is intentionally left in place (not deleted) as a safety backup
 *
 * Returns the UUID of the migrated character, or null if no migration was needed.
 */
export const migrateToMultiCharacter = (): string | null => {
	if (typeof window === 'undefined') return null;

	try {
		// If the roster already has characters, migration already happened
		const roster = getRoster();
		if (roster.characters.length > 0) {
			return roster.activeCharacterId;
		}

		// Check for a legacy single-character save
		const oldCharacter = loadCharacterFromStorage();
		if (oldCharacter && oldCharacter.name) {
			const id = createNewCharacterId();
			saveCharacterById(id, oldCharacter);
			setActiveCharacter(id);

			// The old key is left in place as a safety backup for now.
			// If you want to clean it up: clearCharacterFromStorage();

			return id;
		}

		return null;
	} catch (err) {
		console.error('Failed to migrate to multi-character:', err);
		return null;
	}
};

// ─── File import / export ──────────────────────────────────────────────────────

/**
 * The versioned wrapper format for .persona files.
 * The `version` field allows future importers to handle schema changes gracefully.
 */
interface CharacterFile {
	version: number;
	exportedAt: string;
	character: CharacterState;
}

/**
 * Triggers a browser download of the character as a `.persona` file.
 *
 * The file contains the full character state wrapped in a versioned envelope
 * `{ version, exportedAt, character }`. The filename is derived from the
 * character's name (sanitized to be filesystem-safe).
 *
 * @throws Error if the download mechanism fails (e.g., file creation error)
 */
export const exportCharacterToFile = (character: CharacterState): void => {
	if (typeof window === 'undefined') return;

	try {
		const fileData: CharacterFile = {
			version: FILE_VERSION,
			exportedAt: new Date().toISOString(),
			character,
		};

		const blob = new Blob([JSON.stringify(fileData, null, 2)], {
			type: 'application/json',
		});

		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');

		// Sanitize the character name for use as a filename
		const fileName = character.name
			? character.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
			: 'character';

		link.href = url;
		link.download = `${fileName}${FILE_EXTENSION}`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	} catch (err) {
		console.error('Failed to export character to file:', err);
		throw new Error('Failed to export character');
	}
};

/**
 * Reads a `.persona` file selected by the user and returns the character state.
 *
 * Handles two formats:
 *   - Wrapped format: `{ version, exportedAt, character }` — current format
 *   - Raw format: plain CharacterState object — for backwards compatibility with
 *     files exported before the versioned wrapper was added
 *
 * Version checking: if the file's version is higher than the current version,
 * the import is rejected with a message asking the user to update the app.
 *
 * @param file - The File object from a file input or drag-and-drop event
 * @returns Promise resolving to the parsed CharacterState, or rejecting with an Error
 */
export const importCharacterFromFile = (file: File): Promise<CharacterState> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (event) => {
			try {
				const content = event.target?.result as string;
				const parsed = JSON.parse(content);

				let character: CharacterState;

				if (parsed.version && parsed.character) {
					// Current versioned format
					const fileData = parsed as CharacterFile;

					if (fileData.version > FILE_VERSION) {
						reject(new Error('This file was created with a newer version of Atom Magic. Please update to load it.'));
						return;
					}

					character = fileData.character;
				} else if (parsed.name !== undefined && parsed.scores !== undefined) {
					// Legacy raw format (pre-versioning)
					character = parsed as CharacterState;
				} else {
					reject(new Error('Invalid character file format'));
					return;
				}

				if (typeof character.name !== 'string') {
					reject(new Error('Invalid character data: missing name'));
					return;
				}

				resolve(character);
			} catch (err) {
				reject(new Error('Failed to parse character file. The file may be corrupted.'));
			}
		};

		reader.onerror = () => {
			reject(new Error('Failed to read file'));
		};

		reader.readAsText(file);
	});
};

/** Returns the file extension used for exported character files (`.persona`). */
export const getCharacterFileExtension = (): string => FILE_EXTENSION;
