import { CustomCreatureState } from './slices/customCreatureSlice';

const ROSTER_KEY = 'atom-magic-custom-creatures';
const CREATURE_PREFIX = 'atom-magic-custom-creature-';
const FILE_EXTENSION = '.creatura';
const FILE_VERSION = 1;

// Roster types
export interface CustomCreatureSummary {
	id: string;
	name: string;
	challengeLevel: string;
	creatureType: string;
	health: number;
	attackCount: number;
	abilityCount: number;
	lastModified: string;
}

export interface CustomCreatureRoster {
	activeCreatureId: string | null;
	creatures: CustomCreatureSummary[];
}

// File format wrapper for versioning
interface CreatureFile {
	version: number;
	exportedAt: string;
	creature: CustomCreatureState;
}

const createEmptyRoster = (): CustomCreatureRoster => ({
	activeCreatureId: null,
	creatures: [],
});

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

export const saveCreatureRoster = (roster: CustomCreatureRoster): void => {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
	} catch (err) {
		console.error('Failed to save creature roster to localStorage:', err);
	}
};

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

export const saveCreatureById = (id: string, creature: CustomCreatureState): void => {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem(CREATURE_PREFIX + id, JSON.stringify(creature));

		// Update roster summary
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
			roster.creatures[summaryIndex] = summary;
		} else {
			roster.creatures.push(summary);
		}

		saveCreatureRoster(roster);
	} catch (err) {
		console.error('Failed to save creature to localStorage:', err);
	}
};

export const deleteCreatureById = (id: string): void => {
	if (typeof window === 'undefined') return;

	try {
		localStorage.removeItem(CREATURE_PREFIX + id);

		// Update roster
		const roster = getCreatureRoster();
		roster.creatures = roster.creatures.filter((c) => c.id !== id);

		// If this was the active creature, clear it
		if (roster.activeCreatureId === id) {
			roster.activeCreatureId = null;
		}

		saveCreatureRoster(roster);
	} catch (err) {
		console.error('Failed to delete creature from localStorage:', err);
	}
};

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

export const createNewCreatureId = (): string => {
	return crypto.randomUUID();
};

/**
 * Export creature to a downloadable .creatura file
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

		// Use creature name for filename, fallback to 'creature'
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
 * Import creature from a .creatura file
 * Returns the creature state or throws an error
 */
export const importCreatureFromFile = (file: File): Promise<CustomCreatureState> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (event) => {
			try {
				const content = event.target?.result as string;
				const parsed = JSON.parse(content);

				// Handle both wrapped format (with version) and raw creature state
				let creature: CustomCreatureState;

				if (parsed.version && parsed.creature) {
					// Wrapped format
					const fileData = parsed as CreatureFile;

					// Version check for future compatibility
					if (fileData.version > FILE_VERSION) {
						reject(new Error('This file was created with a newer version of Atom Magic. Please update to load it.'));
						return;
					}

					creature = fileData.creature;
				} else if (parsed.name !== undefined && parsed.attacks !== undefined) {
					// Raw creature state (backwards compatibility)
					creature = parsed as CustomCreatureState;
				} else {
					reject(new Error('Invalid creature file format'));
					return;
				}

				// Basic validation
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

/**
 * Get the file extension for creature files
 */
export const getCreatureFileExtension = (): string => FILE_EXTENSION;
