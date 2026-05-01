/**
 * layout.tsx — Creature Tools shared layout (route group: (creature-tools))
 *
 * Shared layout for Creature Roller, Creature Manager, and Encounter Builder.
 * Fetches all CMS creatures once via `unstable_cache` (1-hour TTL, tagged
 * 'creatures') and provides them to all child routes via `CreatureDataProvider`
 * so each tool doesn't make its own fetch.
 */
import { unstable_cache } from 'next/cache';
import { getPayloadClient } from '@/lib/payload';
import { normalizeCreature, deriveFilters } from '@/lib/creature-types';
import { CreatureDataProvider } from '@/app/components/creatures/CreatureDataContext';

const getCreatures = unstable_cache(
	async () => {
		const payload = await getPayloadClient();
		const result = await payload.find({ collection: 'creatures', limit: 500, depth: 1 });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return result.docs.map((doc) => normalizeCreature(doc as any));
	},
	['creatures-all'],
	{ revalidate: 3600, tags: ['creatures'] },
);

export default async function CreatureToolsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const creatures = await getCreatures();
	const filters = deriveFilters(creatures);

	return (
		<CreatureDataProvider creatures={creatures} filters={filters}>
			{children}
		</CreatureDataProvider>
	);
}
