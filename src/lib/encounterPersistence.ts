// Encounter persistence using localStorage

import {
	Encounter,
	EncounterRoster,
	createEmptyRoster,
	calculateTotalThreat,
} from './encounter-data';

const ROSTER_KEY = 'atom-magic-encounters';
const ENCOUNTER_PREFIX = 'atom-magic-encounter-';

/**
 * Get the encounter roster from localStorage
 */
export const getEncounterRoster = (): EncounterRoster => {
	if (typeof window === 'undefined') {
		return createEmptyRoster();
	}

	try {
		const serialized = localStorage.getItem(ROSTER_KEY);
		if (!serialized) {
			return createEmptyRoster();
		}
		return JSON.parse(serialized) as EncounterRoster;
	} catch (err) {
		console.error('Failed to load encounter roster from localStorage:', err);
		return createEmptyRoster();
	}
};

/**
 * Save the encounter roster to localStorage
 */
export const saveEncounterRoster = (roster: EncounterRoster): void => {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
	} catch (err) {
		console.error('Failed to save encounter roster to localStorage:', err);
	}
};

/**
 * Get an encounter by its ID
 */
export const getEncounterById = (id: string): Encounter | null => {
	if (typeof window === 'undefined') return null;

	try {
		const serialized = localStorage.getItem(ENCOUNTER_PREFIX + id);
		if (!serialized) return null;
		return JSON.parse(serialized) as Encounter;
	} catch (err) {
		console.error('Failed to load encounter from localStorage:', err);
		return null;
	}
};

/**
 * Save an encounter by its ID and update the roster summary
 */
export const saveEncounterById = (id: string, encounter: Encounter): void => {
	if (typeof window === 'undefined') return;

	try {
		// Update lastModified timestamp
		encounter.lastModified = new Date().toISOString();

		// Save the full encounter data
		localStorage.setItem(ENCOUNTER_PREFIX + id, JSON.stringify(encounter));

		// Update the roster with summary info
		const roster = getEncounterRoster();
		const summaryIndex = roster.encounters.findIndex((e) => e.id === id);

		// Create a summary for the roster (we store the full encounter reference)
		const summary: Encounter = {
			id: encounter.id,
			name: encounter.name,
			creatures: encounter.creatures,
			partySize: encounter.partySize,
			lastModified: encounter.lastModified,
		};

		if (summaryIndex >= 0) {
			roster.encounters[summaryIndex] = summary;
		} else {
			roster.encounters.push(summary);
		}

		saveEncounterRoster(roster);
	} catch (err) {
		console.error('Failed to save encounter to localStorage:', err);
	}
};

/**
 * Delete an encounter by its ID
 */
export const deleteEncounterById = (id: string): void => {
	if (typeof window === 'undefined') return;

	try {
		// Remove the encounter data
		localStorage.removeItem(ENCOUNTER_PREFIX + id);

		// Update the roster
		const roster = getEncounterRoster();
		roster.encounters = roster.encounters.filter((e) => e.id !== id);

		// If this was the active encounter, clear it
		if (roster.activeEncounterId === id) {
			roster.activeEncounterId = null;
		}

		saveEncounterRoster(roster);
	} catch (err) {
		console.error('Failed to delete encounter from localStorage:', err);
	}
};

/**
 * Set the active encounter ID
 */
export const setActiveEncounter = (id: string | null): void => {
	if (typeof window === 'undefined') return;

	try {
		const roster = getEncounterRoster();
		roster.activeEncounterId = id;
		saveEncounterRoster(roster);
	} catch (err) {
		console.error('Failed to set active encounter:', err);
	}
};

/**
 * Get the total threat for an encounter summary (for roster display)
 */
export const getEncounterThreat = (encounter: Encounter): number => {
	return calculateTotalThreat(encounter.creatures);
};

/**
 * Copy encounter summary to clipboard
 */
export const copyEncounterToClipboard = async (summary: string): Promise<boolean> => {
	if (typeof window === 'undefined') return false;

	try {
		await navigator.clipboard.writeText(summary);
		return true;
	} catch (err) {
		console.error('Failed to copy to clipboard:', err);
		return false;
	}
};
