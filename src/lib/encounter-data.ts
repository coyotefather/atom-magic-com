// Encounter Builder data types and utility functions

// Threat point values for each challenge level
export const THREAT_VALUES: Record<string, number> = {
	harmless: 0,
	trivial: 1,
	easy: 2,
	moderate: 4,
	hard: 8,
	deadly: 16,
};

// Difficulty thresholds per player
export const DIFFICULTY_THRESHOLDS = {
	trivial: { min: 0, max: 1 },
	easy: { min: 1, max: 2 },
	moderate: { min: 3, max: 4 },
	hard: { min: 5, max: 7 },
	deadly: { min: 8, max: Infinity },
};

export type DifficultyRating = 'trivial' | 'easy' | 'moderate' | 'hard' | 'deadly';

// A creature added to an encounter
export interface EncounterCreature {
	creatureId: string;      // Reference to creature _id from Sanity
	name: string;            // Cached for display
	challengeLevel: string;  // harmless, trivial, easy, moderate, hard, deadly
	quantity: number;
	source?: 'cms' | 'custom';  // Optional for backwards compat, defaults to 'cms'
}

// A saved encounter
export interface Encounter {
	id: string;
	name: string;
	creatures: EncounterCreature[];
	partySize: number;
	lastModified: string;
}

// The roster of all saved encounters
export interface EncounterRoster {
	encounters: Encounter[];
	activeEncounterId: string | null;
}

/**
 * Calculate threat points for a single creature
 */
export const getCreatureThreat = (challengeLevel: string): number => {
	return THREAT_VALUES[challengeLevel] ?? 0;
};

/**
 * Calculate total threat for an encounter
 */
export const calculateTotalThreat = (creatures: EncounterCreature[]): number => {
	return creatures.reduce((total, creature) => {
		const threatPerCreature = getCreatureThreat(creature.challengeLevel);
		return total + (threatPerCreature * creature.quantity);
	}, 0);
};

/**
 * Calculate threat per player
 */
export const calculateThreatPerPlayer = (totalThreat: number, partySize: number): number => {
	if (partySize <= 0) return totalThreat;
	return totalThreat / partySize;
};

/**
 * Determine difficulty rating based on threat per player
 */
export const getDifficultyRating = (threatPerPlayer: number): DifficultyRating => {
	if (threatPerPlayer < DIFFICULTY_THRESHOLDS.trivial.max) return 'trivial';
	if (threatPerPlayer <= DIFFICULTY_THRESHOLDS.easy.max) return 'easy';
	if (threatPerPlayer <= DIFFICULTY_THRESHOLDS.moderate.max) return 'moderate';
	if (threatPerPlayer <= DIFFICULTY_THRESHOLDS.hard.max) return 'hard';
	return 'deadly';
};

/**
 * Get display-friendly difficulty label
 */
export const getDifficultyLabel = (rating: DifficultyRating): string => {
	const labels: Record<DifficultyRating, string> = {
		trivial: 'Trivial',
		easy: 'Easy',
		moderate: 'Moderate',
		hard: 'Hard',
		deadly: 'Deadly',
	};
	return labels[rating];
};

/**
 * Get difficulty color class for styling
 */
export const getDifficultyColor = (rating: DifficultyRating): string => {
	const colors: Record<DifficultyRating, string> = {
		trivial: 'text-stone',
		easy: 'text-laurel',
		moderate: 'text-gold',
		hard: 'text-bronze',
		deadly: 'text-oxblood',
	};
	return colors[rating];
};

/**
 * Get challenge level color class (matches CreatureCard styling)
 */
export const getChallengeLevelColor = (challengeLevel: string): string => {
	const colors: Record<string, string> = {
		harmless: 'bg-stone/10 text-stone-dark',
		trivial: 'bg-stone/20 text-stone',
		easy: 'bg-laurel/20 text-laurel',
		moderate: 'bg-gold/20 text-gold',
		hard: 'bg-bronze/20 text-bronze',
		deadly: 'bg-oxblood/20 text-oxblood',
	};
	return colors[challengeLevel] ?? 'bg-stone/10 text-stone';
};

/**
 * Generate a text summary of the encounter for copying
 */
export const generateEncounterSummary = (
	encounter: Encounter,
	totalThreat: number,
	rating: DifficultyRating
): string => {
	const lines: string[] = [
		`ENCOUNTER: ${encounter.name}`,
		`Party Size: ${encounter.partySize}`,
		`Difficulty: ${getDifficultyLabel(rating)}`,
		`Total Threat: ${totalThreat}`,
		'',
		'CREATURES:',
	];

	for (const creature of encounter.creatures) {
		const threatPoints = getCreatureThreat(creature.challengeLevel) * creature.quantity;
		const customTag = creature.source === 'custom' ? ' [Custom]' : '';
		lines.push(`- ${creature.name}${customTag} (${creature.challengeLevel}) x${creature.quantity} = ${threatPoints} pts`);
	}

	return lines.join('\n');
};

/**
 * Create a new empty encounter
 */
export const createNewEncounter = (name: string = 'New Encounter'): Encounter => {
	return {
		id: crypto.randomUUID(),
		name,
		creatures: [],
		partySize: 4,
		lastModified: new Date().toISOString(),
	};
};

/**
 * Create an empty encounter roster
 */
export const createEmptyRoster = (): EncounterRoster => {
	return {
		encounters: [],
		activeEncounterId: null,
	};
};
