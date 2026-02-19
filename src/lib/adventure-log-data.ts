// Adventure Log data types and utility functions

export type EntryType = 'roll' | 'action' | 'note';
export type NoteCategory = 'story' | 'npc' | 'discovery' | 'combat' | 'other';
export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

// Base entry shared by all types
interface BaseLogEntry {
	id: string;
	timestamp: string;           // ISO string
	type: EntryType;
	characterId?: string;        // Optional link to saved character
	characterName?: string;      // Display name (either from character or custom text)
	isKeyEvent: boolean;         // Flag for "Previously on..." export
}

// Roll entry - can come from Dice Roller or manual entry
export interface RollLogEntry extends BaseLogEntry {
	type: 'roll';
	dieType: DieType;
	numDice: number;
	modifier: number;
	rolls: number[];
	total: number;
	context?: string;            // "Attack roll", "Perception check", etc.
}

// Action entry - character actions
export interface ActionLogEntry extends BaseLogEntry {
	type: 'action';
	description: string;         // "Varro picked the lock"
}

// GM Note entry - story beats, NPC encounters, discoveries
export interface NoteLogEntry extends BaseLogEntry {
	type: 'note';
	content: string;
	category?: NoteCategory;
}

export type LogEntry = RollLogEntry | ActionLogEntry | NoteLogEntry;

// A saved session
export interface Session {
	id: string;
	name: string;
	description?: string;
	entries: LogEntry[];
	createdAt: string;
	lastModified: string;
	campaignId?: string;   // links this session to a campaign (optional)
}

// Session summary for roster display
export interface SessionSummary {
	id: string;
	name: string;
	entryCount: number;
	keyEventCount: number;
	lastModified: string;
	campaignId?: string;
}

// The roster of all saved sessions
export interface SessionRoster {
	sessions: SessionSummary[];
	activeSessionId: string | null;
}

// Note category labels and colors
export const NOTE_CATEGORIES: { value: NoteCategory; label: string; color: string }[] = [
	{ value: 'story', label: 'Story', color: 'bg-gold/20 text-gold' },
	{ value: 'combat', label: 'Combat', color: 'bg-oxblood/20 text-oxblood' },
	{ value: 'npc', label: 'NPC', color: 'bg-laurel/20 text-laurel' },
	{ value: 'discovery', label: 'Discovery', color: 'bg-bronze/20 text-bronze' },
	{ value: 'other', label: 'Other', color: 'bg-stone/20 text-stone' },
];

/**
 * Get display label for a note category
 */
export const getNoteCategoryLabel = (category?: NoteCategory): string => {
	if (!category) return 'Note';
	const found = NOTE_CATEGORIES.find(c => c.value === category);
	return found?.label || 'Note';
};

/**
 * Get color class for a note category
 */
export const getNoteCategoryColor = (category?: NoteCategory): string => {
	if (!category) return 'bg-stone/20 text-stone';
	const found = NOTE_CATEGORIES.find(c => c.value === category);
	return found?.color || 'bg-stone/20 text-stone';
};

/**
 * Format dice notation (e.g., "2d6+3")
 */
export const formatDiceNotation = (numDice: number, dieType: DieType, modifier: number): string => {
	let notation = `${numDice}${dieType}`;
	if (modifier > 0) {
		notation += `+${modifier}`;
	} else if (modifier < 0) {
		notation += `${modifier}`;
	}
	return notation;
};

/**
 * Format timestamp for display
 */
export const formatTimestamp = (timestamp: string): string => {
	const date = new Date(timestamp);
	return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format full timestamp with date
 */
export const formatFullTimestamp = (timestamp: string): string => {
	const date = new Date(timestamp);
	return date.toLocaleString([], {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

/**
 * Create a new empty session
 */
export const createNewSession = (name: string = 'New Session'): Session => {
	const now = new Date().toISOString();
	return {
		id: crypto.randomUUID(),
		name,
		entries: [],
		createdAt: now,
		lastModified: now,
	};
};

/**
 * Create an empty session roster
 */
export const createEmptyRoster = (): SessionRoster => {
	return {
		sessions: [],
		activeSessionId: null,
	};
};

/**
 * Create a roll entry from dice roller result
 */
export const createRollEntry = (
	roll: {
		dieType: DieType;
		numDice: number;
		modifier: number;
		rolls: number[];
		total: number;
	},
	options?: {
		characterId?: string;
		characterName?: string;
		context?: string;
		isKeyEvent?: boolean;
	}
): RollLogEntry => {
	return {
		id: crypto.randomUUID(),
		timestamp: new Date().toISOString(),
		type: 'roll',
		dieType: roll.dieType,
		numDice: roll.numDice,
		modifier: roll.modifier,
		rolls: roll.rolls,
		total: roll.total,
		context: options?.context,
		characterId: options?.characterId,
		characterName: options?.characterName,
		isKeyEvent: options?.isKeyEvent || false,
	};
};

/**
 * Create an action entry
 */
export const createActionEntry = (
	description: string,
	options?: {
		characterId?: string;
		characterName?: string;
		isKeyEvent?: boolean;
	}
): ActionLogEntry => {
	return {
		id: crypto.randomUUID(),
		timestamp: new Date().toISOString(),
		type: 'action',
		description,
		characterId: options?.characterId,
		characterName: options?.characterName,
		isKeyEvent: options?.isKeyEvent || false,
	};
};

/**
 * Create a note entry
 */
export const createNoteEntry = (
	content: string,
	options?: {
		category?: NoteCategory;
		isKeyEvent?: boolean;
	}
): NoteLogEntry => {
	return {
		id: crypto.randomUUID(),
		timestamp: new Date().toISOString(),
		type: 'note',
		content,
		category: options?.category,
		isKeyEvent: options?.isKeyEvent || false,
	};
};

/**
 * Generate "Previously on..." summary from key events
 */
export const generateSessionSummary = (session: Session): string => {
	const keyEvents = session.entries.filter(e => e.isKeyEvent);

	const lines: string[] = [
		`PREVIOUSLY ON... ${session.name}`,
		'',
	];

	if (keyEvents.length === 0) {
		lines.push('No key events marked for this session.');
		return lines.join('\n');
	}

	for (const entry of keyEvents) {
		switch (entry.type) {
			case 'action':
				if (entry.characterName) {
					lines.push(`- ${entry.characterName}: ${entry.description}`);
				} else {
					lines.push(`- ${entry.description}`);
				}
				break;
			case 'note':
				const categoryLabel = entry.category
					? `[${getNoteCategoryLabel(entry.category).toUpperCase()}]`
					: '';
				lines.push(`- ${categoryLabel} ${entry.content}`.trim());
				break;
			case 'roll':
				if (entry.context) {
					const roller = entry.characterName || 'Unknown';
					lines.push(`- ${roller} rolled ${entry.total} on ${entry.context}`);
				}
				break;
		}
	}

	return lines.join('\n');
};

/**
 * Count key events in a session
 */
export const countKeyEvents = (entries: LogEntry[]): number => {
	return entries.filter(e => e.isKeyEvent).length;
};
