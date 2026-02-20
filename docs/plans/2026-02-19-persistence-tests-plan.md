# Persistence Layer Tests Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add comprehensive tests for `sessionPersistence.ts` and `characterPersistence.ts`, the two untested localStorage persistence layers that underpin the Adventure Log and Character Manager.

**Architecture:** Pure test files — no implementation changes. Follows the exact pattern of `src/lib/__tests__/campaignPersistence.test.ts`: `beforeEach(() => localStorage.clear())`, factory helper functions, `describe`/`it` blocks, direct localStorage key inspection to verify behaviour.

**Tech Stack:** Vitest with jsdom environment (globals enabled — `describe`/`it`/`expect` available without import). Run with `npm test`. localStorage is available natively in jsdom.

---

## Key constants (match the source files exactly)

**sessionPersistence.ts:**
- Roster key: `'atom-magic-sessions'`
- Session prefix: `'atom-magic-session-'` + id

**characterPersistence.ts:**
- Roster key: `'atom-magic-roster'`
- Character prefix: `'atom-magic-character-'` + id
- Legacy single-char key: `'atom-magic-character'`

---

## Task 1: Session persistence tests

**Files:**
- Create: `src/lib/__tests__/sessionPersistence.test.ts`

**Step 1: Create the test file**

Create `src/lib/__tests__/sessionPersistence.test.ts`:

```typescript
import {
	getSessionRoster,
	saveSessionRoster,
	getSessionById,
	saveSessionById,
	deleteSessionById,
	setActiveSession,
} from '@/lib/sessionPersistence';
import { Session, createNewSession, createNoteEntry } from '@/lib/adventure-log-data';

const ROSTER_KEY = 'atom-magic-sessions';
const SESSION_PREFIX = 'atom-magic-session-';

function makeSession(overrides?: Partial<Session>): Session {
	const session = createNewSession('Test Session');
	session.id = 'session-1';
	return { ...session, ...overrides };
}

beforeEach(() => {
	localStorage.clear();
});

describe('getSessionRoster', () => {
	it('returns empty roster when nothing is saved', () => {
		const roster = getSessionRoster();
		expect(roster.sessions).toEqual([]);
		expect(roster.activeSessionId).toBeNull();
	});

	it('returns the saved roster', () => {
		const roster = { sessions: [], activeSessionId: 'session-1' };
		localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
		expect(getSessionRoster()).toEqual(roster);
	});
});

describe('saveSessionRoster', () => {
	it('persists the roster to localStorage', () => {
		const roster = { sessions: [], activeSessionId: 'session-1' };
		saveSessionRoster(roster);
		const raw = localStorage.getItem(ROSTER_KEY);
		expect(JSON.parse(raw!)).toEqual(roster);
	});
});

describe('getSessionById', () => {
	it('returns null when session does not exist', () => {
		expect(getSessionById('nonexistent')).toBeNull();
	});

	it('returns the saved session', () => {
		const session = makeSession();
		localStorage.setItem(SESSION_PREFIX + session.id, JSON.stringify(session));
		const result = getSessionById(session.id);
		expect(result).not.toBeNull();
		expect(result!.id).toBe('session-1');
		expect(result!.name).toBe('Test Session');
	});
});

describe('saveSessionById', () => {
	it('saves the full session to localStorage', () => {
		const session = makeSession();
		saveSessionById(session.id, session);
		const raw = localStorage.getItem(SESSION_PREFIX + 'session-1');
		expect(raw).not.toBeNull();
		expect(JSON.parse(raw!).name).toBe('Test Session');
	});

	it('adds a summary to the roster with correct entry count', () => {
		const session = makeSession();
		session.entries = [createNoteEntry('A note')];
		saveSessionById(session.id, session);
		const roster = getSessionRoster();
		expect(roster.sessions).toHaveLength(1);
		expect(roster.sessions[0].id).toBe('session-1');
		expect(roster.sessions[0].entryCount).toBe(1);
	});

	it('propagates campaignId into the roster summary', () => {
		const session = makeSession({ campaignId: 'campaign-abc' });
		saveSessionById(session.id, session);
		expect(getSessionRoster().sessions[0].campaignId).toBe('campaign-abc');
	});

	it('counts only key events in the summary', () => {
		const keyEntry = createNoteEntry('A key moment');
		keyEntry.isKeyEvent = true;
		const session = makeSession();
		session.entries = [keyEntry, createNoteEntry('A regular note')];
		saveSessionById(session.id, session);
		expect(getSessionRoster().sessions[0].keyEventCount).toBe(1);
	});

	it('updates an existing roster summary rather than adding a duplicate', () => {
		const session = makeSession();
		saveSessionById(session.id, session);
		saveSessionById(session.id, { ...session, name: 'Renamed' });
		const roster = getSessionRoster();
		expect(roster.sessions).toHaveLength(1);
		expect(roster.sessions[0].name).toBe('Renamed');
	});

	it('updates lastModified on the saved session', () => {
		const before = new Date().toISOString();
		const session = makeSession({ lastModified: '2020-01-01T00:00:00.000Z' });
		saveSessionById(session.id, session);
		const saved = JSON.parse(localStorage.getItem(SESSION_PREFIX + 'session-1')!);
		expect(saved.lastModified >= before).toBe(true);
	});
});

describe('deleteSessionById', () => {
	it('removes the session data from localStorage', () => {
		saveSessionById('session-1', makeSession());
		deleteSessionById('session-1');
		expect(localStorage.getItem(SESSION_PREFIX + 'session-1')).toBeNull();
	});

	it('removes the session from the roster', () => {
		saveSessionById('session-1', makeSession());
		deleteSessionById('session-1');
		expect(getSessionRoster().sessions).toHaveLength(0);
	});

	it('clears activeSessionId when the active session is deleted', () => {
		saveSessionById('session-1', makeSession());
		setActiveSession('session-1');
		deleteSessionById('session-1');
		expect(getSessionRoster().activeSessionId).toBeNull();
	});

	it('preserves activeSessionId when a different session is deleted', () => {
		saveSessionById('session-1', makeSession());
		saveSessionById('session-2', makeSession({ id: 'session-2', name: 'Session Two' }));
		setActiveSession('session-1');
		deleteSessionById('session-2');
		expect(getSessionRoster().activeSessionId).toBe('session-1');
	});
});

describe('setActiveSession', () => {
	it('sets the active session id in the roster', () => {
		setActiveSession('session-abc');
		expect(getSessionRoster().activeSessionId).toBe('session-abc');
	});

	it('clears the active session id when passed null', () => {
		setActiveSession('session-abc');
		setActiveSession(null);
		expect(getSessionRoster().activeSessionId).toBeNull();
	});
});
```

**Step 2: Run the tests**

```bash
npm test -- src/lib/__tests__/sessionPersistence.test.ts
```

Expected: **17 tests pass**. (No implementation changes are needed — the code already works; these tests verify it.)

If any tests fail, read `src/lib/sessionPersistence.ts` carefully and fix the test's assumptions to match actual behaviour (do not change the implementation).

**Step 3: Run the full suite to confirm no regressions**

```bash
npm test
```

Expected: all tests pass (83 total).

**Step 4: Commit**

```bash
git add src/lib/__tests__/sessionPersistence.test.ts
git commit -m "test: add session persistence tests"
```

---

## Task 2: Character persistence tests

**Files:**
- Create: `src/lib/__tests__/characterPersistence.test.ts`

**Context for the shield calculation tested here:**

`saveCharacterById` computes shield values from `character.scores`:
- Find the score with `title === 'Physical'` → average its `subscores[].value` → round → add `armor.physicalShieldBonus + armor.enhancement?.physicalShieldBonus`
- Same for Psyche / psychicShield

`isComplete` requires: name, culture, path, patronage (all truthy) + disciplines.length > 0 + gear.length > 0 + wealth.silver > 0.

The `makeCharacter` factory below produces a character where Physical avg = 7 (subscores 8 + 6), Psyche avg = 9 (subscores 10 + 8), armor physicalShieldBonus = 2, psychicShieldBonus = 1 → expected physicalShield = 9, psychicShield = 10.

**Step 1: Create the test file**

Create `src/lib/__tests__/characterPersistence.test.ts`:

```typescript
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
```

**Step 2: Run the tests**

```bash
npm test -- src/lib/__tests__/characterPersistence.test.ts
```

Expected: **21 tests pass**.

If any tests fail, read `src/lib/characterPersistence.ts` and correct the test's expected values to match the actual computation (do not change the implementation).

**Step 3: Run the full suite to confirm no regressions**

```bash
npm test
```

Expected: all tests pass (104 total: 66 existing + 17 session + 21 character).

**Step 4: Commit**

```bash
git add src/lib/__tests__/characterPersistence.test.ts
git commit -m "test: add character persistence tests"
```

---

## Task 3: Mark roadmap items complete + final commit

**Files:**
- Modify: `ROADMAP.md`

**Step 1: Mark both items complete**

In `ROADMAP.md`, find the two lines added for session and character persistence tests and change `- [ ]` to `- [x]` on both:

```markdown
- [x] **Session persistence tests** - `sessionPersistence.ts`: ...
- [x] **Character persistence tests** - `characterPersistence.ts`: ...
```

**Step 2: Commit**

```bash
git add ROADMAP.md
git commit -m "docs: mark session and character persistence tests complete"
```
