import { getPayloadClient } from '@/lib/payload';
import { normalizeCreature, deriveFilters } from '@/lib/creature-types';
import { CreatureDataProvider } from '@/app/components/creatures/CreatureDataContext';

export default async function CreatureToolsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const payload = await getPayloadClient();
	const result = await payload.find({ collection: 'creatures', limit: 500, depth: 1 });

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const creatures = result.docs.map((doc) => normalizeCreature(doc as any));
	const filters = deriveFilters(creatures);

	return (
		<CreatureDataProvider creatures={creatures} filters={filters}>
			{children}
		</CreatureDataProvider>
	);
}
