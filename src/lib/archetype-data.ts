/**
 * archetype-data.ts
 *
 * Archetype definitions used by the character generator to produce thematically
 * coherent random characters. An archetype describes a *role* (e.g., Healer,
 * Blaster, Mentalist) and influences how the generator picks disciplines,
 * techniques, and distributes scores.
 *
 * ## How archetypes work
 * Each archetype carries three influence vectors:
 *   - `disciplines`: ordered list of discipline titles to prefer when picking the
 *     character's disciplines from the CMS list. The generator tries these in
 *     order before falling back to random.
 *   - `techniqueKeywords`: keywords to match against technique descriptions when
 *     filtering the technique pool for this archetype's flavor.
 *   - `scoreWeights`: relative multipliers (0.6–1.5) applied to each core score
 *     when randomly distributing score points. Higher weight = more points flow
 *     to that score. All four weights sum to roughly 4.0 but the generator
 *     normalizes them, so the absolute values don't matter — only the ratios.
 *   - `pathPreference` (optional): if set, the generator will prefer this path
 *     (Theurgist / Iconoclast / Autodidact) when one isn't already chosen.
 *
 * ## Special archetype: 'any'
 * The first entry has id `'any'` with uniform weights and empty discipline/keyword
 * lists. Selecting 'any' in the generator UI produces a fully random character
 * with no archetype bias.
 *
 * ## Path-linked archetypes
 * Three archetypes have pathPreference set:
 *   - scholar → Theurgist (academy-trained, intellect-heavy)
 *   - heretic → Iconoclast (forbidden disciplines, psyche-heavy)
 *   - wildtalent → Autodidact (instinctive, physical/psyche split)
 *
 * Used by:
 *   - `src/lib/character-generator.ts` (applies weights during generation)
 *   - `src/app/components/character/sections/GeneratorOptions.tsx` (archetype picker)
 */

export interface Archetype {
	id: string;
	name: string;
	description: string;
	disciplines: string[];           // Discipline titles to prefer (in order of preference)
	techniqueKeywords: string[];     // Keywords to match in technique descriptions
	scoreWeights: {                  // Relative weights for score randomization (higher = favor this score)
		physical: number;
		interpersonal: number;
		intellect: number;
		psyche: number;
	};
	pathPreference?: string;         // Optional path this archetype works best with
}

export const ARCHETYPES: Archetype[] = [
	{
		id: 'any',
		name: 'Any',
		description: 'Fully random - no archetype preference',
		disciplines: [],
		techniqueKeywords: [],
		scoreWeights: { physical: 1, interpersonal: 1, intellect: 1, psyche: 1 },
	},
	{
		id: 'healer',
		name: 'Healer',
		description: 'Focused on mending wounds and curing ailments',
		disciplines: ['Biological', 'Chemical'],
		techniqueKeywords: ['heal', 'mend', 'cure', 'restore', 'purge', 'repair'],
		scoreWeights: { physical: 0.7, interpersonal: 1, intellect: 1.3, psyche: 1 },
	},
	{
		id: 'blaster',
		name: 'Blaster',
		description: 'Raw destructive power through elemental forces',
		disciplines: ['Thermal', 'Fission/Fusion', 'Kinetic', 'Electromagnetic'],
		techniqueKeywords: ['damage', 'burst', 'blast', 'strike', 'surge', 'bolt'],
		scoreWeights: { physical: 1, interpersonal: 0.6, intellect: 1.4, psyche: 0.8 },
	},
	{
		id: 'controller',
		name: 'Controller',
		description: 'Battlefield manipulation and crowd control',
		disciplines: ['Gravity', 'Kinetic', 'Atmospheric', 'Temporal'],
		techniqueKeywords: ['control', 'push', 'pull', 'hold', 'slow', 'barrier', 'wall'],
		scoreWeights: { physical: 0.8, interpersonal: 0.7, intellect: 1.3, psyche: 1.2 },
	},
	{
		id: 'mentalist',
		name: 'Mentalist',
		description: 'Mind manipulation and psychic powers',
		disciplines: ['Psychic', 'Luminous'],
		techniqueKeywords: ['mind', 'psychic', 'mental', 'thought', 'illusion', 'sense'],
		scoreWeights: { physical: 0.6, interpersonal: 1.1, intellect: 1, psyche: 1.5 },
	},
	{
		id: 'support',
		name: 'Support',
		description: 'Buffs, enhancements, and team utility',
		disciplines: ['Biological', 'Chemical', 'Acoustic'],
		techniqueKeywords: ['enhance', 'boost', 'buff', 'protect', 'shield', 'resist'],
		scoreWeights: { physical: 0.8, interpersonal: 1.2, intellect: 1.2, psyche: 1 },
	},
	{
		id: 'elementalist',
		name: 'Elementalist',
		description: 'Versatile control over natural elements',
		disciplines: ['Thermal', 'Atmospheric', 'Lithic', 'Electromagnetic'],
		techniqueKeywords: ['fire', 'ice', 'storm', 'earth', 'lightning', 'weather'],
		scoreWeights: { physical: 0.9, interpersonal: 0.7, intellect: 1.3, psyche: 1 },
	},
	{
		id: 'shadow',
		name: 'Shadow',
		description: 'Stealth, darkness, and concealment',
		disciplines: ['Luminous', 'Psychic', 'Acoustic'],
		techniqueKeywords: ['dark', 'shadow', 'invisible', 'hide', 'silent', 'sneak'],
		scoreWeights: { physical: 1.1, interpersonal: 0.8, intellect: 1, psyche: 1.2 },
	},
	{
		id: 'scholar',
		name: 'Scholar',
		description: 'Academy-trained balanced practitioner',
		disciplines: ['Disciplina Academica', 'Temporal', 'Psychic'],
		techniqueKeywords: ['study', 'analyze', 'knowledge', 'learn', 'understand'],
		scoreWeights: { physical: 0.7, interpersonal: 1, intellect: 1.5, psyche: 0.9 },
		pathPreference: 'Theurgist',
	},
	{
		id: 'heretic',
		name: 'Heretic',
		description: 'Forbidden techniques and dark arts',
		disciplines: ['Ars Prohibita', 'Fission/Fusion', 'Biological'],
		techniqueKeywords: ['forbidden', 'dark', 'death', 'drain', 'corrupt', 'necrotic'],
		scoreWeights: { physical: 0.8, interpersonal: 0.6, intellect: 1.2, psyche: 1.4 },
		pathPreference: 'Iconoclast',
	},
	{
		id: 'wildtalent',
		name: 'Wild Talent',
		description: 'Self-taught with unconventional abilities',
		disciplines: ['Empirica Indomita', 'Kinetic', 'Thermal'],
		techniqueKeywords: ['instinct', 'raw', 'wild', 'surge', 'unleash'],
		scoreWeights: { physical: 1.2, interpersonal: 0.8, intellect: 0.9, psyche: 1.3 },
		pathPreference: 'Autodidact',
	},
];

/**
 * Get archetype by ID
 */
export function getArchetypeById(id: string): Archetype | undefined {
	return ARCHETYPES.find(a => a.id === id);
}

/**
 * Get archetypes that work well with a specific path
 */
export function getArchetypesForPath(pathTitle: string): Archetype[] {
	return ARCHETYPES.filter(a =>
		!a.pathPreference || a.pathPreference === pathTitle
	);
}
