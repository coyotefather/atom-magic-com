import { CharacterState } from './slices/characterSlice';

const STORAGE_KEY = 'atom-magic-character';
const ROSTER_KEY = 'atom-magic-roster';
const CHARACTER_PREFIX = 'atom-magic-character-';
const FILE_EXTENSION = '.solum';
const FILE_VERSION = 1;

// Roster types
export interface CharacterSummary {
	id: string;
	name: string;
	culture: string;
	path: string;
	patronage: string;
	physicalShield: number;
	psychicShield: number;
	armorCapacity: number;
	disciplineCount: number;
	techniqueCount: number;
	isComplete: boolean;
	lastModified: string;
}

export interface CharacterRoster {
	activeCharacterId: string | null;
	characters: CharacterSummary[];
}

export const saveCharacterToStorage = (character: CharacterState): void => {
	if (typeof window === 'undefined') return;

	try {
		const serialized = JSON.stringify(character);
		localStorage.setItem(STORAGE_KEY, serialized);
	} catch (err) {
		console.error('Failed to save character to localStorage:', err);
	}
};

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

export const clearCharacterFromStorage = (): void => {
	if (typeof window === 'undefined') return;

	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch (err) {
		console.error('Failed to clear character from localStorage:', err);
	}
};

export const hasStoredCharacter = (): boolean => {
	if (typeof window === 'undefined') return false;

	try {
		return localStorage.getItem(STORAGE_KEY) !== null;
	} catch {
		return false;
	}
};

// ============================================
// Multi-Character Roster Functions
// ============================================

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

export const saveRoster = (roster: CharacterRoster): void => {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
	} catch (err) {
		console.error('Failed to save roster to localStorage:', err);
	}
};

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

export const saveCharacterById = (id: string, character: CharacterState): void => {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem(CHARACTER_PREFIX + id, JSON.stringify(character));

		// Calculate shield values
		const physicalScore = character.scores.find(s => s.title === 'Physical');
		const psycheScore = character.scores.find(s => s.title === 'Psyche');
		const physicalAvg = physicalScore?.subscores?.length
			? Math.round(physicalScore.subscores.reduce((sum, sub) => sum + (sub.value || 0), 0) / physicalScore.subscores.length)
			: 0;
		const psycheAvg = psycheScore?.subscores?.length
			? Math.round(psycheScore.subscores.reduce((sum, sub) => sum + (sub.value || 0), 0) / psycheScore.subscores.length)
			: 0;

		// Get gear bonuses
		const armor = character.gear.find(g => g.type === 'armor');
		const enhancement = armor?.enhancement;
		const physicalShieldBonus = (armor?.physicalShieldBonus || 0) + (enhancement?.physicalShieldBonus || 0);
		const psychicShieldBonus = (armor?.psychicShieldBonus || 0) + (enhancement?.psychicShieldBonus || 0);

		// Check if character is complete (has all major sections filled)
		const isComplete = Boolean(
			character.name &&
			character.culture &&
			character.path &&
			character.patronage &&
			character.disciplines.length > 0 &&
			character.gear.length > 0 &&
			character.wealth.silver > 0
		);

		// Update roster summary
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
			roster.characters[summaryIndex] = summary;
		} else {
			roster.characters.push(summary);
		}

		saveRoster(roster);
	} catch (err) {
		console.error('Failed to save character to localStorage:', err);
	}
};

export const deleteCharacterById = (id: string): void => {
	if (typeof window === 'undefined') return;

	try {
		localStorage.removeItem(CHARACTER_PREFIX + id);

		// Update roster
		const roster = getRoster();
		roster.characters = roster.characters.filter((c) => c.id !== id);

		// If this was the active character, clear it
		if (roster.activeCharacterId === id) {
			roster.activeCharacterId = null;
		}

		saveRoster(roster);
	} catch (err) {
		console.error('Failed to delete character from localStorage:', err);
	}
};

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

export const createNewCharacterId = (): string => {
	return crypto.randomUUID();
};

/**
 * Migrate from old single-character storage to multi-character roster
 */
export const migrateToMultiCharacter = (): string | null => {
	if (typeof window === 'undefined') return null;

	try {
		// Check if already migrated
		const roster = getRoster();
		if (roster.characters.length > 0) {
			return roster.activeCharacterId;
		}

		// Check for old single-character storage
		const oldCharacter = loadCharacterFromStorage();
		if (oldCharacter && oldCharacter.name) {
			const id = createNewCharacterId();
			saveCharacterById(id, oldCharacter);
			setActiveCharacter(id);

			// Optionally clear old storage (keeping for now for safety)
			// clearCharacterFromStorage();

			return id;
		}

		return null;
	} catch (err) {
		console.error('Failed to migrate to multi-character:', err);
		return null;
	}
};

// File format wrapper for versioning
interface CharacterFile {
	version: number;
	exportedAt: string;
	character: CharacterState;
}

/**
 * Export character to a downloadable .solum file
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

		// Use character name for filename, fallback to 'character'
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
 * Import character from a .solum file
 * Returns the character state or throws an error
 */
export const importCharacterFromFile = (file: File): Promise<CharacterState> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (event) => {
			try {
				const content = event.target?.result as string;
				const parsed = JSON.parse(content);

				// Handle both wrapped format (with version) and raw character state
				let character: CharacterState;

				if (parsed.version && parsed.character) {
					// Wrapped format
					const fileData = parsed as CharacterFile;

					// Version check for future compatibility
					if (fileData.version > FILE_VERSION) {
						reject(new Error('This file was created with a newer version of Atom Magic. Please update to load it.'));
						return;
					}

					character = fileData.character;
				} else if (parsed.name !== undefined && parsed.scores !== undefined) {
					// Raw character state (backwards compatibility)
					character = parsed as CharacterState;
				} else {
					reject(new Error('Invalid character file format'));
					return;
				}

				// Basic validation
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

/**
 * Get the file extension for character files
 */
export const getCharacterFileExtension = (): string => FILE_EXTENSION;
