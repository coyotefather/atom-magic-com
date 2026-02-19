// Session persistence using localStorage

import {
	Session,
	SessionSummary,
	SessionRoster,
	createEmptyRoster,
	countKeyEvents,
} from './adventure-log-data';

const ROSTER_KEY = 'atom-magic-sessions';
const SESSION_PREFIX = 'atom-magic-session-';

/**
 * Get the session roster from localStorage
 */
export const getSessionRoster = (): SessionRoster => {
	if (typeof window === 'undefined') {
		return createEmptyRoster();
	}

	try {
		const serialized = localStorage.getItem(ROSTER_KEY);
		if (!serialized) {
			return createEmptyRoster();
		}
		return JSON.parse(serialized) as SessionRoster;
	} catch (err) {
		console.error('Failed to load session roster from localStorage:', err);
		return createEmptyRoster();
	}
};

/**
 * Save the session roster to localStorage
 */
export const saveSessionRoster = (roster: SessionRoster): void => {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
	} catch (err) {
		console.error('Failed to save session roster to localStorage:', err);
	}
};

/**
 * Get a session by its ID
 */
export const getSessionById = (id: string): Session | null => {
	if (typeof window === 'undefined') return null;

	try {
		const serialized = localStorage.getItem(SESSION_PREFIX + id);
		if (!serialized) return null;
		return JSON.parse(serialized) as Session;
	} catch (err) {
		console.error('Failed to load session from localStorage:', err);
		return null;
	}
};

/**
 * Save a session by its ID and update the roster summary
 */
export const saveSessionById = (id: string, session: Session): void => {
	if (typeof window === 'undefined') return;

	try {
		// Update lastModified timestamp
		session.lastModified = new Date().toISOString();

		// Save the full session data
		localStorage.setItem(SESSION_PREFIX + id, JSON.stringify(session));

		// Update the roster with summary info
		const roster = getSessionRoster();
		const summaryIndex = roster.sessions.findIndex((s) => s.id === id);

		// Create a summary for the roster
		const summary: SessionSummary = {
			id: session.id,
			name: session.name,
			entryCount: session.entries.length,
			keyEventCount: countKeyEvents(session.entries),
			lastModified: session.lastModified,
			campaignId: session.campaignId,
		};

		if (summaryIndex >= 0) {
			roster.sessions[summaryIndex] = summary;
		} else {
			roster.sessions.push(summary);
		}

		saveSessionRoster(roster);
	} catch (err) {
		console.error('Failed to save session to localStorage:', err);
	}
};

/**
 * Delete a session by its ID
 */
export const deleteSessionById = (id: string): void => {
	if (typeof window === 'undefined') return;

	try {
		// Remove the session data
		localStorage.removeItem(SESSION_PREFIX + id);

		// Update the roster
		const roster = getSessionRoster();
		roster.sessions = roster.sessions.filter((s) => s.id !== id);

		// If this was the active session, clear it
		if (roster.activeSessionId === id) {
			roster.activeSessionId = null;
		}

		saveSessionRoster(roster);
	} catch (err) {
		console.error('Failed to delete session from localStorage:', err);
	}
};

/**
 * Set the active session ID
 */
export const setActiveSession = (id: string | null): void => {
	if (typeof window === 'undefined') return;

	try {
		const roster = getSessionRoster();
		roster.activeSessionId = id;
		saveSessionRoster(roster);
	} catch (err) {
		console.error('Failed to set active session:', err);
	}
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
	if (typeof window === 'undefined') return false;

	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (err) {
		console.error('Failed to copy to clipboard:', err);
		return false;
	}
};
