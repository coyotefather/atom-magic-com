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
