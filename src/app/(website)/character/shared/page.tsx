import { Suspense } from 'react';
import { sanityFetch } from '@/sanity/lib/client';
import {
	CULTURES_QUERY,
	PATHS_QUERY,
	PATRONAGES_QUERY,
	DISCIPLINES_QUERY,
} from '@/sanity/lib/queries';
import {
	CULTURES_QUERY_RESULT,
	PATHS_QUERY_RESULT,
	PATRONAGES_QUERY_RESULT,
	DISCIPLINES_QUERY_RESULT,
} from '../../../../../sanity.types';
import SharedCharacterPageContent from './SharedCharacterPageContent';

// Loading fallback for Suspense boundary
function LoadingState() {
	return (
		<main className="notoserif min-h-screen bg-parchment dark:bg-black">
			<div className="container px-6 md:px-8 py-8">
				<div className="text-center py-16">
					<p className="text-stone dark:text-stone-light">Loading character...</p>
				</div>
			</div>
		</main>
	);
}

export default async function SharedCharacterPage() {
	// Fetch Sanity data to resolve IDs to names
	const [cultures, paths, patronages, disciplines] = await Promise.all([
		sanityFetch<CULTURES_QUERY_RESULT>({ query: CULTURES_QUERY }),
		sanityFetch<PATHS_QUERY_RESULT>({ query: PATHS_QUERY }),
		sanityFetch<PATRONAGES_QUERY_RESULT>({ query: PATRONAGES_QUERY }),
		sanityFetch<DISCIPLINES_QUERY_RESULT>({ query: DISCIPLINES_QUERY }),
	]);

	return (
		<Suspense fallback={<LoadingState />}>
			<SharedCharacterPageContent
				cultures={cultures}
				paths={paths}
				patronages={patronages}
				disciplines={disciplines}
			/>
		</Suspense>
	);
}
