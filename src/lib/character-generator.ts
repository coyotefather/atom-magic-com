/**
 * Character Generator
 * Generates random characters with optional archetype and locked field support
 */

import { CharacterState } from './slices/characterSlice';
import { Archetype, getArchetypeById, ARCHETYPES } from './archetype-data';
import { rollGear, GearRollingOptions, getRandomElement } from './gear-data';
import { ANIMAL_COMPANIONS } from './global-data';
import {
	CULTURES_QUERY_RESULT,
	PATHS_QUERY_RESULT,
	PATRONAGES_QUERY_RESULT,
	DISCIPLINES_QUERY_RESULT,
	SCORES_QUERY_RESULT,
} from '../../sanity.types';

// Types for generator options
export interface LockedFields {
	culture?: string;
	path?: string;
	patronage?: string;
}

export interface GeneratorOptions {
	mode: 'easy' | 'advanced';
	archetype?: string;           // Archetype ID for easy mode
	lockedFields?: LockedFields;  // For advanced mode
	pathPreference?: string;      // Optional path preference (path _id)
}

export interface GeneratorData {
	cultures: CULTURES_QUERY_RESULT;
	paths: PATHS_QUERY_RESULT;
	patronages: PATRONAGES_QUERY_RESULT;
	disciplines: DISCIPLINES_QUERY_RESULT;
	scores: SCORES_QUERY_RESULT;
}

// Helper to get random integer in range (inclusive)
function getRandomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to get weighted random value based on archetype score weights
function getWeightedScore(baseMin: number, baseMax: number, weight: number): number {
	// Weight affects the center of the distribution
	// weight > 1 pushes scores higher, weight < 1 pushes lower
	const center = (baseMin + baseMax) / 2;
	const adjustedCenter = center * weight;
	const adjustedMin = Math.max(baseMin, Math.round(adjustedCenter - (center - baseMin)));
	const adjustedMax = Math.min(baseMax, Math.round(adjustedCenter + (baseMax - center)));
	return getRandomInt(adjustedMin, adjustedMax);
}

/**
 * Generate a random culture
 */
function generateCulture(
	cultures: CULTURES_QUERY_RESULT,
	locked?: string
): string {
	if (locked) return locked;
	const culture = getRandomElement(cultures);
	return culture?._id || '';
}

/**
 * Generate a random path
 */
function generatePath(
	paths: PATHS_QUERY_RESULT,
	locked?: string,
	preference?: string,
	archetype?: Archetype
): string {
	if (locked) return locked;
	if (preference) return preference;

	// If archetype has a path preference, use it
	if (archetype?.pathPreference) {
		const preferredPath = paths.find(p => p.title === archetype.pathPreference);
		if (preferredPath) return preferredPath._id;
	}

	const path = getRandomElement(paths);
	return path?._id || '';
}

/**
 * Generate a random patronage
 */
function generatePatronage(
	patronages: PATRONAGES_QUERY_RESULT,
	locked?: string
): string {
	if (locked) return locked;
	const patronage = getRandomElement(patronages);
	return patronage?._id || '';
}

/**
 * Generate random scores with optional archetype weighting
 */
function generateScores(
	scoresData: SCORES_QUERY_RESULT,
	archetype?: Archetype
): CharacterState['scores'] {
	const weights = archetype?.scoreWeights || { physical: 1, interpersonal: 1, intellect: 1, psyche: 1 };

	return scoresData.map(score => {
		// Determine weight for this score category
		let weight = 1;
		if (score.title?.toLowerCase().includes('physical')) weight = weights.physical;
		else if (score.title?.toLowerCase().includes('interpersonal')) weight = weights.interpersonal;
		else if (score.title?.toLowerCase().includes('intellect')) weight = weights.intellect;
		else if (score.title?.toLowerCase().includes('psyche')) weight = weights.psyche;

		// Generate subscores with weights
		const subscores = score.subscores?.map(sub => ({
			_id: sub._id,
			title: sub.title,
			description: sub.description,
			value: getWeightedScore(20, 80, weight), // Subscores typically range 20-80
		})) || [];

		// Calculate average
		const avg = subscores.length > 0
			? Math.round(subscores.reduce((sum, s) => sum + (s.value || 0), 0) / subscores.length)
			: 0;

		return {
			_id: score._id,
			title: score.title,
			subscores,
			description: score.description,
			value: avg,
		};
	});
}

/**
 * Generate disciplines based on path and archetype
 */
function generateDisciplines(
	disciplines: DISCIPLINES_QUERY_RESULT,
	pathId: string,
	archetype?: Archetype
): string[] {
	// Filter disciplines available for this path
	const availableDisciplines = disciplines.filter(d =>
		d.paths?.some(p => p._id === pathId)
	);

	if (availableDisciplines.length === 0) return [];

	// If archetype specified, prefer matching disciplines
	if (archetype && archetype.disciplines.length > 0) {
		const preferredDisciplines = availableDisciplines.filter(d =>
			archetype.disciplines.some(pref =>
				d.title?.toLowerCase().includes(pref.toLowerCase())
			)
		);

		// Take up to 2, preferring archetype matches
		const selected: string[] = [];

		// First, add preferred disciplines
		for (const disc of preferredDisciplines) {
			if (selected.length < 2) {
				selected.push(disc._id);
			}
		}

		// Fill remaining slots with random disciplines
		const remaining = availableDisciplines.filter(d => !selected.includes(d._id));
		while (selected.length < 2 && remaining.length > 0) {
			const random = getRandomElement(remaining);
			if (random) {
				selected.push(random._id);
				remaining.splice(remaining.indexOf(random), 1);
			}
		}

		return selected;
	}

	// Random selection: pick 2
	const shuffled = [...availableDisciplines].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, 2).map(d => d._id);
}

/**
 * Generate techniques for selected disciplines
 */
function generateTechniques(
	disciplines: DISCIPLINES_QUERY_RESULT,
	selectedDisciplineIds: string[],
	archetype?: Archetype
): string[] {
	const techniques: string[] = [];

	for (const discId of selectedDisciplineIds) {
		const discipline = disciplines.find(d => d._id === discId);
		if (!discipline?.techniques || discipline.techniques.length === 0) continue;

		// If archetype, try to find matching techniques
		let selectedTechnique: typeof discipline.techniques[0] | undefined;

		if (archetype && archetype.techniqueKeywords.length > 0) {
			// Find technique matching archetype keywords
			const matchingTechniques = discipline.techniques.filter(t =>
				archetype.techniqueKeywords.some(keyword =>
					t.title?.toLowerCase().includes(keyword) ||
					t.description?.toLowerCase().includes(keyword)
				)
			);

			if (matchingTechniques.length > 0) {
				selectedTechnique = getRandomElement(matchingTechniques);
			}
		}

		// Fallback to random technique
		if (!selectedTechnique) {
			selectedTechnique = getRandomElement(discipline.techniques);
		}

		if (selectedTechnique) {
			techniques.push(selectedTechnique._id);
		}
	}

	return techniques;
}

/**
 * Generate random gear
 */
function generateGear(): CharacterState['gear'] {
	const options: GearRollingOptions = {
		includeExoticWeapons: Math.random() > 0.7,  // 30% chance of exotic
		includeExoticArmor: Math.random() > 0.7,
		includeWeaponEnhancements: Math.random() > 0.5,
		includeArmorEnhancements: Math.random() > 0.5,
		weaponCategories: ['light', 'medium', 'heavy'],
		weaponTypes: ['melee', 'ranged'],
		armorCategories: ['light', 'medium', 'heavy'],
		tiers: [1, 2, 3],
	};

	const result = rollGear(options);
	const gear: CharacterState['gear'] = [];

	if (result.weapon) {
		gear.push({
			id: `weapon-${result.weapon.name}-${Date.now()}`,
			name: result.weapon.name,
			type: 'weapon',
			category: result.weapon.category,
			tier: result.weapon.tier,
			damage: result.weapon.damage,
			description: result.weapon.description,
			isExotic: result.weapon.isExotic,
			enhancement: result.weaponEnhancement ? {
				name: result.weaponEnhancement.name,
				description: result.weaponEnhancement.description,
				physicalShieldBonus: result.weaponEnhancement.physicalShieldBonus,
				psychicShieldBonus: result.weaponEnhancement.psychicShieldBonus,
			} : undefined,
		});
	}

	if (result.armor) {
		gear.push({
			id: `armor-${result.armor.name}-${Date.now()}`,
			name: result.armor.name,
			type: 'armor',
			category: result.armor.category,
			tier: result.armor.tier,
			capacity: result.armor.capacity,
			penalties: result.armor.penalties,
			description: result.armor.description,
			isExotic: result.armor.isExotic,
			physicalShieldBonus: result.armor.physicalShieldBonus,
			psychicShieldBonus: result.armor.psychicShieldBonus,
			enhancement: result.armorEnhancement ? {
				name: result.armorEnhancement.name,
				description: result.armorEnhancement.description,
				physicalShieldBonus: result.armorEnhancement.physicalShieldBonus,
				psychicShieldBonus: result.armorEnhancement.psychicShieldBonus,
			} : undefined,
		});
	}

	return gear;
}

/**
 * Generate random wealth
 */
function generateWealth(): CharacterState['wealth'] {
	return {
		silver: getRandomInt(10, 99),
		gold: getRandomInt(1, 20),
		lead: getRandomInt(0, 5),
		uranium: getRandomInt(0, 2),
	};
}

/**
 * Generate random animal companion
 */
function generateAnimalCompanion(): CharacterState['animalCompanion'] {
	// 50% chance of having a companion
	if (Math.random() > 0.5) {
		return { id: '', name: '', details: '' };
	}

	const categories = Object.keys(ANIMAL_COMPANIONS);
	const categoryKey = getRandomElement(categories) as keyof typeof ANIMAL_COMPANIONS;
	const category = ANIMAL_COMPANIONS[categoryKey];
	const animal = getRandomElement(category.children);

	return {
		id: animal?.id || '',
		name: animal?.name || '',
		details: `A loyal ${animal?.name?.toLowerCase() || 'companion'}`,
	};
}

/**
 * Main character generation function
 */
export function generateCharacter(
	options: GeneratorOptions,
	data: GeneratorData
): CharacterState {
	const archetype = options.archetype ? getArchetypeById(options.archetype) : undefined;
	const locked = options.lockedFields || {};

	// Generate path first (needed for discipline filtering)
	const pathId = generatePath(
		data.paths,
		locked.path,
		options.pathPreference,
		archetype
	);

	// Generate disciplines based on path
	const disciplineIds = generateDisciplines(data.disciplines, pathId, archetype);

	// Generate techniques for those disciplines
	const techniqueIds = generateTechniques(data.disciplines, disciplineIds, archetype);

	// Generate scores with archetype weighting
	const scores = generateScores(data.scores, archetype);

	// Generate gear
	const gear = generateGear();

	// Build the character
	const character: CharacterState = {
		loaded: true,
		name: 'Generated Character',
		age: getRandomInt(18, 60),
		pronouns: getRandomElement(['he/him', 'she/her', 'they/them']) || '',
		description: archetype && archetype.id !== 'any'
			? `A ${archetype.name.toLowerCase()} type character.`
			: 'A randomly generated character.',
		culture: generateCulture(data.cultures, locked.culture),
		path: pathId,
		patronage: generatePatronage(data.patronages, locked.patronage),
		scorePoints: 0,
		scores,
		additionalScores: [],
		disciplines: disciplineIds,
		techniques: techniqueIds,
		gear,
		wealth: generateWealth(),
		animalCompanion: generateAnimalCompanion(),
	};

	return character;
}

/**
 * Get available archetypes (for UI dropdown)
 */
export function getAvailableArchetypes(): Archetype[] {
	return ARCHETYPES;
}
