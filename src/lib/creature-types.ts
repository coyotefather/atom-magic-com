/**
 * creature-types.ts
 *
 * TypeScript interfaces and normalizer functions for CMS creature data.
 *
 * Background:
 *   Creatures are fetched from Payload CMS and used in three places:
 *     - Creature Roller (random creature cards with stats)
 *     - Encounter Builder (adding creatures to a combat encounter)
 *     - Creature Manager (cloning a CMS creature as the base for a custom one)
 *
 *   Raw Payload creature documents have a few quirks that the normalizer
 *   (`normalizeCreature()`) fixes before the data is used in the UI:
 *
 *   1. `id: number` → Both `id: number` and `_id: string` are added for
 *      compatibility with the same components that handle character data
 *      (which expect `_id: string` from the Sanity era).
 *
 *   2. `environments: Array<{ environment: string }>` → `environments: string[]`
 *      Payload's array field type requires each item to be an object with named
 *      fields. The raw format is `[{ environment: "Forest" }, { environment: "Mountains" }]`.
 *      The normalizer flattens this to `["Forest", "Mountains"]` for easier use.
 *
 *   3. `mainImage: { url: string, ... }` → `mainImageUrl: string | null`
 *      The raw document has a full Media object (if the relationship is resolved
 *      at depth >= 1) or just an ID (if not resolved). The normalizer safely
 *      extracts the URL string and provides null if the image isn't present.
 *
 * Used by:
 *   - Page layouts for creature-related routes (fetch + normalize on the server)
 *   - `src/app/components/creatures/CreatureDataContext.tsx` (distributes to components)
 *   - `src/lib/customCreaturePersistence.ts` (import/export uses the same shape)
 */

/**
 * A CMS creature document normalized for use in the UI.
 *
 * All fields match the Creatures collection schema, with these differences:
 *   - `_id` is added as a string copy of `id` (for component compatibility)
 *   - `environments` is a flat `string[]` (flattened from Payload's array-of-objects format)
 *   - `mainImageUrl` is a plain string URL extracted from the Media relationship
 */
export interface NormedCreature {
	id: number
	_id: string             // String copy of `id` — used by legacy character components
	name: string
	slug: string
	description?: string | null   // Short 1-2 sentence description for roller cards
	mainImageUrl?: string | null  // URL of the main image (extracted from Media relationship)
	physical?: number | null
	interpersonal?: number | null
	intellect?: number | null
	psyche?: number | null
	health?: number | null
	physicalShield?: number | null
	psychicShield?: number | null
	armorCapacity?: number | null
	attacks?: Array<{ id: string; name: string; damage?: string | null }> | null
	specialAbilities?: Array<{ id: string; name: string; description?: string | null }> | null
	/** One of: harmless, trivial, easy, moderate, hard, deadly */
	challengeLevel?: 'harmless' | 'trivial' | 'easy' | 'moderate' | 'hard' | 'deadly' | null
	creatureType?: string | null  // e.g., "Beast", "Construct", "Humanoid"
	/** Flattened from Payload's `[{ environment: string }]` format to `string[]`. */
	environments?: string[]
	isSwarm?: boolean | null    // True if this creature fights as a group/swarm
	isUnique?: boolean | null   // True if this is a named individual (boss/villain)
}

/**
 * The set of unique filter values derived from the full creature list.
 *
 * Used to populate filter dropdowns in the Creature Roller and Encounter Builder.
 * Generated once server-side by `deriveFilters()` so components don't need to
 * re-derive them from scratch.
 */
export interface CreatureFilters {
	/** All unique challenge levels present in the creature list (e.g., ["easy", "moderate", "hard"]). */
	challengeLevels: string[]
	/** All unique creature types present (e.g., ["Beast", "Humanoid", "Construct"]). */
	creatureTypes: string[]
	/** All unique environments present (e.g., ["Forest", "Mountains", "Underground"]). */
	environments: string[]
}

/**
 * Normalizes a raw Payload creature document into a `NormedCreature`.
 *
 * This handles the three main differences between raw Payload data and the shape
 * the UI expects:
 *   1. Adds `_id: String(id)` for component compatibility
 *   2. Flattens `environments: [{ environment: string }]` to `string[]`
 *   3. Extracts `mainImageUrl` from the resolved Media object (or null if absent)
 *
 * Safe to call on documents where relationships were not resolved (`depth: 0`) —
 * in that case, `mainImageUrl` will be null (the mainImage will just be a number ID).
 *
 * @param doc - A raw Payload creature document as a generic Record
 *              (typed loosely because it comes from Payload's generic `find()` result)
 */
export function normalizeCreature(doc: Record<string, unknown>): NormedCreature {
	// Flatten environments from Payload's array-of-objects format to a plain string array
	const environments = (doc.environments as Array<{ environment: string }> | null | undefined)
		?.map((e) => e.environment)
		.filter(Boolean) ?? []

	// Safely extract the image URL from the Media relationship object, if resolved.
	// At depth 0, mainImage is just a number ID; at depth >= 1, it's a Media object.
	const mainImage = doc.mainImage as { url?: string } | null | undefined
	const mainImageUrl = mainImage && typeof mainImage === 'object' && 'url' in mainImage
		? (mainImage.url ?? null)
		: null

	return {
		id: doc.id as number,
		_id: String(doc.id),
		name: (doc.name as string) ?? '',
		slug: (doc.slug as string) ?? '',
		description: doc.description as string | null | undefined,
		mainImageUrl,
		physical: doc.physical as number | null | undefined,
		interpersonal: doc.interpersonal as number | null | undefined,
		intellect: doc.intellect as number | null | undefined,
		psyche: doc.psyche as number | null | undefined,
		health: doc.health as number | null | undefined,
		physicalShield: doc.physicalShield as number | null | undefined,
		psychicShield: doc.psychicShield as number | null | undefined,
		armorCapacity: doc.armorCapacity as number | null | undefined,
		attacks: doc.attacks as NormedCreature['attacks'],
		specialAbilities: doc.specialAbilities as NormedCreature['specialAbilities'],
		challengeLevel: doc.challengeLevel as NormedCreature['challengeLevel'],
		creatureType: doc.creatureType as string | null | undefined,
		environments,
		isSwarm: doc.isSwarm as boolean | null | undefined,
		isUnique: doc.isUnique as boolean | null | undefined,
	}
}

/**
 * Derives the set of unique filter values from a normalized creature list.
 *
 * Extracts all unique challenge levels, creature types, and environments
 * from the full list. Null/undefined values are filtered out.
 *
 * Called once after `normalizeCreature()` is applied to the full creature list,
 * and the result is stored alongside the list in `CreatureDataContext` so filter
 * dropdowns don't need to re-derive their options on every render.
 *
 * @param creatures - The normalized creature list to derive filters from
 */
export function deriveFilters(creatures: NormedCreature[]): CreatureFilters {
	const challengeLevels = [
		...new Set(creatures.map((c) => c.challengeLevel).filter(Boolean) as string[]),
	]
	const creatureTypes = [
		...new Set(creatures.map((c) => c.creatureType).filter(Boolean) as string[]),
	]
	const environments = [
		...new Set(creatures.flatMap((c) => c.environments ?? [])),
	]

	return { challengeLevels, creatureTypes, environments }
}
