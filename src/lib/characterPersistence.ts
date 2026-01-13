import { CharacterState } from './slices/characterSlice';

const STORAGE_KEY = 'atom-magic-character';

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
