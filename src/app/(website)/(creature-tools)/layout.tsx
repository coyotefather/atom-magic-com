import { sanityFetch } from '@/sanity/lib/client';
import {
	CREATURES_QUERY,
	CREATURE_FILTERS_QUERY,
} from '@/sanity/lib/queries';
import {
	CREATURES_QUERY_RESULT,
	CREATURE_FILTERS_QUERY_RESULT,
} from '../../../../sanity.types';
import { CreatureDataProvider } from '@/app/components/creatures/CreatureDataContext';

export default async function CreatureToolsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Fetch creature data once for all pages in this route group
	const [creatures, filters] = await Promise.all([
		sanityFetch<CREATURES_QUERY_RESULT>({
			query: CREATURES_QUERY,
			tags: ['creatures'],
		}),
		sanityFetch<CREATURE_FILTERS_QUERY_RESULT>({
			query: CREATURE_FILTERS_QUERY,
			tags: ['creature-filters'],
		}),
	]);

	return (
		<CreatureDataProvider creatures={creatures} filters={filters}>
			{children}
		</CreatureDataProvider>
	);
}
