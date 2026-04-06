export interface NormedCreature {
	id: number
	_id: string
	name: string
	slug: string
	description?: string | null
	mainImageUrl?: string | null
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
	challengeLevel?: 'harmless' | 'trivial' | 'easy' | 'moderate' | 'hard' | 'deadly' | null
	creatureType?: string | null
	environments?: string[]
	isSwarm?: boolean | null
	isUnique?: boolean | null
}

export interface CreatureFilters {
	challengeLevels: string[]
	creatureTypes: string[]
	environments: string[]
}

export function normalizeCreature(doc: Record<string, unknown>): NormedCreature {
	const environments = (doc.environments as Array<{ environment: string }> | null | undefined)
		?.map((e) => e.environment)
		.filter(Boolean) ?? []

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

export function deriveFilters(creatures: NormedCreature[]): CreatureFilters {
	const challengeLevels = [
		...new Set(creatures.map((c) => c.challengeLevel).filter((v): v is string => Boolean(v))),
	]
	const creatureTypes = [
		...new Set(creatures.map((c) => c.creatureType).filter((v): v is string => Boolean(v))),
	]
	const environments = [
		...new Set(creatures.flatMap((c) => c.environments ?? [])),
	]

	return { challengeLevels, creatureTypes, environments }
}
