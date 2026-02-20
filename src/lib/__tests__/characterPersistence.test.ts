import {
	getRoster,
	getCharacterById,
	saveCharacterById,
	deleteCharacterById,
	setActiveCharacter,
	migrateToMultiCharacter,
} from '@/lib/characterPersistence';
import type { CharacterState } from '@/lib/slices/characterSlice';

const ROSTER_KEY = 'atom-magic-roster';
const CHARACTER_PREFIX = 'atom-magic-character-';
const OLD_STORAGE_KEY = 'atom-magic-character';

function makeCharacter(overrides?: Partial<CharacterState>): CharacterState {
	return {
		loaded: true,
		name: 'Varro',
		age: 30,
		pronouns: 'he/him',
		description: '',
		culture: 'spiranos',
		path: 'theurgist',
		patronage: 'sovereign',
		scorePoints: 0,
		scores: [
			{
				_id: 'physical',
				title: 'Physical',
				subscores: [
					{ _id: 'str', title: 'Strength', description: null, value: 8 },
					{ _id: 'agi', title: 'Agility', description: null, value: 6 },
				],
				description: null,
				value: null,
			},
			{
				_id: 'psyche',
				title: 'Psyche',
				subscores: [
					{ _id: 'wil', title: 'Willpower', description: null, value: 10 },
					{ _id: 'int', title: 'Intuition', description: null, value: 8 },
				],
				description: null,
				value: null,
			},
		],
		additionalScores: [],
		disciplines: ['thermal'],
		techniques: [],
		gear: [
			{
				id: 'armor-1',
				name: 'Lorica',
				type: 'armor',
				category: 'medium',
				tier: 1,
				isExotic: false,
				capacity: 5,
				physicalShieldBonus: 2,
				psychicShieldBonus: 1,
			},
		],
		wealth: { silver: 10, gold: 0, lead: 0, uranium: 0 },
		animalCompanion: { id: '', name: '', details: '' },
		...overrides,
	};
}

beforeEach(() => {
	localStorage.clear();
});

describe('getRoster', () => {
	it('returns an empty roster when nothing is saved', () => {
		const roster = getRoster();
		expect(roster.characters).toEqual([]);
		expect(roster.activeCharacterId).toBeNull();
	});

	it('returns the saved roster', () => {
		const roster = { activeCharacterId: 'char-1', characters: [] };
		localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
		expect(getRoster()).toEqual(roster);
	});
});

describe('getCharacterById', () => {
	it('returns null when character does not exist', () => {
		expect(getCharacterById('nonexistent')).toBeNull();
	});

	it('returns the saved character', () => {
		localStorage.setItem(CHARACTER_PREFIX + 'char-1', JSON.stringify(makeCharacter()));
		const result = getCharacterById('char-1');
		expect(result).not.toBeNull();
		expect(result!.name).toBe('Varro');
	});
});

describe('saveCharacterById', () => {
	it('saves the character to localStorage', () => {
		saveCharacterById('char-1', makeCharacter());
		const raw = localStorage.getItem(CHARACTER_PREFIX + 'char-1');
		expect(raw).not.toBeNull();
		expect(JSON.parse(raw!).name).toBe('Varro');
	});

	it('adds the character to the roster summary', () => {
		saveCharacterById('char-1', makeCharacter());
		const roster = getRoster();
		expect(roster.characters).toHaveLength(1);
		expect(roster.characters[0].id).toBe('char-1');
		expect(roster.characters[0].name).toBe('Varro');
	});

	it('calculates physicalShield as score average + armor bonus', () => {
		// Physical subscores: 8, 6 → avg 7; armor physicalShieldBonus 2 → total 9
		saveCharacterById('char-1', makeCharacter());
		expect(getRoster().characters[0].physicalShield).toBe(9);
	});

	it('calculates psychicShield as score average + armor bonus', () => {
		// Psyche subscores: 10, 8 → avg 9; armor psychicShieldBonus 1 → total 10
		saveCharacterById('char-1', makeCharacter());
		expect(getRoster().characters[0].psychicShield).toBe(10);
	});

	it('marks isComplete true when all required fields are present', () => {
		saveCharacterById('char-1', makeCharacter());
		expect(getRoster().characters[0].isComplete).toBe(true);
	});

	it('marks isComplete false when name is missing', () => {
		saveCharacterById('char-1', makeCharacter({ name: '' }));
		expect(getRoster().characters[0].isComplete).toBe(false);
	});

	it('marks isComplete false when disciplines array is empty', () => {
		saveCharacterById('char-1', makeCharacter({ disciplines: [] }));
		expect(getRoster().characters[0].isComplete).toBe(false);
	});

	it('marks isComplete false when no silver wealth', () => {
		saveCharacterById('char-1', makeCharacter({ wealth: { silver: 0, gold: 0, lead: 0, uranium: 0 } }));
		expect(getRoster().characters[0].isComplete).toBe(false);
	});

	it('updates an existing roster summary without adding a duplicate', () => {
		saveCharacterById('char-1', makeCharacter());
		saveCharacterById('char-1', makeCharacter({ name: 'Livia' }));
		const roster = getRoster();
		expect(roster.characters).toHaveLength(1);
		expect(roster.characters[0].name).toBe('Livia');
	});
});

describe('deleteCharacterById', () => {
	it('removes the character from localStorage', () => {
		saveCharacterById('char-1', makeCharacter());
		deleteCharacterById('char-1');
		expect(localStorage.getItem(CHARACTER_PREFIX + 'char-1')).toBeNull();
	});

	it('removes the character from the roster', () => {
		saveCharacterById('char-1', makeCharacter());
		deleteCharacterById('char-1');
		expect(getRoster().characters).toHaveLength(0);
	});

	it('clears activeCharacterId when the active character is deleted', () => {
		saveCharacterById('char-1', makeCharacter());
		setActiveCharacter('char-1');
		deleteCharacterById('char-1');
		expect(getRoster().activeCharacterId).toBeNull();
	});

	it('preserves activeCharacterId when a different character is deleted', () => {
		saveCharacterById('char-1', makeCharacter());
		saveCharacterById('char-2', makeCharacter({ name: 'Livia' }));
		setActiveCharacter('char-1');
		deleteCharacterById('char-2');
		expect(getRoster().activeCharacterId).toBe('char-1');
	});
});

describe('setActiveCharacter', () => {
	it('sets the active character id in the roster', () => {
		setActiveCharacter('char-1');
		expect(getRoster().activeCharacterId).toBe('char-1');
	});

	it('clears the active character id when passed null', () => {
		setActiveCharacter('char-1');
		setActiveCharacter(null);
		expect(getRoster().activeCharacterId).toBeNull();
	});
});

describe('migrateToMultiCharacter', () => {
	it('returns null when no legacy storage exists', () => {
		expect(migrateToMultiCharacter()).toBeNull();
	});

	it('returns null when the roster already has characters (already migrated)', () => {
		saveCharacterById('char-1', makeCharacter());
		localStorage.setItem(OLD_STORAGE_KEY, JSON.stringify(makeCharacter()));
		expect(migrateToMultiCharacter()).toBeNull();
	});

	it('migrates a legacy single-character to the multi-character roster', () => {
		localStorage.setItem(OLD_STORAGE_KEY, JSON.stringify(makeCharacter()));
		const newId = migrateToMultiCharacter();
		expect(newId).not.toBeNull();
		const roster = getRoster();
		expect(roster.characters).toHaveLength(1);
		expect(roster.characters[0].name).toBe('Varro');
		expect(roster.activeCharacterId).toBe(newId);
	});
});
