'use client';

/**
 * CreatureDataContext.tsx
 *
 * React Context that makes the creature list and active filter set available
 * to all creature-related components without having to pass them as props
 * through multiple component layers.
 *
 * The creature tools (roller, encounter builder, creature manager) all need
 * access to the full list of CMS creatures and the currently active filters.
 * Without a context, this data would need to be prop-drilled through many
 * layers: page → layout → section → card → sub-component.
 *
 * What this context provides:
 *   - `creatures` — The full normalized list of CMS creatures loaded server-side.
 *     These are `NormedCreature` objects (with `_id` string shim added, environments
 *     flattened from `[{ environment: string }]` to `string[]`, and `mainImage.url`
 *     resolved). See `src/lib/creature-types.ts` for the full shape.
 *   - `filters` — The set of filter values extracted from the CMS data (e.g., all
 *     unique creature types, all environment names, all challenge levels). These
 *     are derived from the creature list at fetch time and passed alongside it so
 *     filter UI components don't need to re-derive them from scratch.
 *
 * How data flows into this context:
 *   1. The page (e.g., `/creatures/page.tsx`) fetches creatures server-side via
 *      `getPayloadClient()` and computes filters.
 *   2. The page passes them to `<CreatureDataProvider creatures={...} filters={...}>`.
 *   3. All descendant components access the data via `useCreatureData()` without
 *      any prop drilling.
 *
 * Note: This is a READ-ONLY context — it only distributes the initial server-fetched
 * data. Mutations (e.g., editing a creature in the Creature Manager) go through
 * the Redux `customCreature` slice, NOT through this context.
 *
 * Consumed by:
 *   - src/app/components/creatures/CreatureRoller.tsx
 *   - src/app/components/encounters/EncounterBuilder.tsx
 *   - src/app/components/creatures/CreatureManager.tsx (reads the CMS list for cloning)
 *   - src/app/components/creatures/CreaturePicker.tsx (CMS creature selection modal)
 */

import { createContext, useContext, ReactNode } from 'react';
import type { NormedCreature, CreatureFilters } from '@/lib/creature-types';

interface CreatureDataContextType {
	/** All CMS creatures, normalized for use in character components. */
	creatures: NormedCreature[];
	/** Available filter values derived from the creature list (types, environments, etc.). */
	filters: CreatureFilters;
}

const CreatureDataContext = createContext<CreatureDataContextType | null>(null);

/**
 * Provides creature data to all descendant components.
 *
 * Mount this in the page or layout that fetches creature data, wrapping all
 * components that need access to the creature list or filters.
 *
 * @param creatures - The full list of CMS creatures (server-fetched and normalized).
 * @param filters - The derived filter options (computed from the creature list).
 */
export function CreatureDataProvider({
	children,
	creatures,
	filters,
}: {
	children: ReactNode;
	creatures: NormedCreature[];
	filters: CreatureFilters;
}) {
	return (
		<CreatureDataContext.Provider value={{ creatures, filters }}>
			{children}
		</CreatureDataContext.Provider>
	);
}

/**
 * Hook to access the creature list and filters from the nearest
 * `<CreatureDataProvider>` in the component tree.
 *
 * Throws an error if used outside a provider to prevent silent failures
 * where a component silently receives empty data.
 *
 * @example
 *   const { creatures, filters } = useCreatureData();
 */
export function useCreatureData(): CreatureDataContextType {
	const context = useContext(CreatureDataContext);
	if (!context) {
		throw new Error('useCreatureData must be used within a CreatureDataProvider');
	}
	return context;
}
