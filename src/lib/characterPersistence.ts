import { CharacterState } from './slices/characterSlice';

const STORAGE_KEY = 'atom-magic-character';
const FILE_EXTENSION = '.solum';
const FILE_VERSION = 1;

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
