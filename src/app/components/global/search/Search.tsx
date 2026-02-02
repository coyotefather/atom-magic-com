'use client';

import { Hits, Stats } from 'react-instantsearch';
import { InstantSearchNext } from 'react-instantsearch-nextjs';
import Hit from '@/app/components/global/search/Hit';
import CustomSearchBox from '@/app/components/global/search/CustomSearchBox';
import CustomPagination from '@/app/components/global/search/CustomPagination';
import CustomHitsPerPage from '@/app/components/global/search/CustomHitsPerPage';
import { createCachedSearchClient } from '@/app/components/global/search/cachedSearchClient';
import { useOffline } from '@/lib/OfflineContext';
import Icon from '@mdi/react';
import { mdiWifiOff } from '@mdi/js';

const searchClient = createCachedSearchClient(
	process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
	process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
);

export function Search() {
	const { isOffline } = useOffline();

	if (isOffline) {
		return (
			<div className="text-center py-12">
				<Icon path={mdiWifiOff} size={2} className="mx-auto mb-4 text-stone" />
				<h2 className="marcellus text-xl mb-2 text-charcoal dark:text-parchment">
					Search Unavailable Offline
				</h2>
				<p className="text-stone dark:text-stone/80">
					Search requires an internet connection. You can still browse cached
					Codex pages.
				</p>
			</div>
		);
	}

	return (
		<InstantSearchNext
			indexName="entries"
			future={{ preserveSharedStateOnUnmount: false }}
			searchClient={searchClient}
			routing={{
				router: {
					cleanUrlOnDispose: false,
					windowTitle(routeState) {
						const indexState = routeState.indexName || {};
						return indexState.query
							? `Atom Magic Codex - Results for: ${indexState.query}`
							: 'Atom Magic Codex - Results page';
					},
				},
			}}
		>
			<div className="space-y-6">
				{/* Search bar and controls */}
				<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
					<div className="flex-grow w-full sm:w-auto">
						<CustomSearchBox />
					</div>
					<CustomHitsPerPage
						items={[
							{ label: '10 per page', value: 10, default: true },
							{ label: '25 per page', value: 25 },
							{ label: '50 per page', value: 50 },
						]}
					/>
				</div>

				{/* Stats */}
				<div className="text-sm text-stone">
					<Stats
						translations={{
							rootElementText({ nbHits, processingTimeMS }) {
								return `${nbHits.toLocaleString()} ${nbHits === 1 ? 'result' : 'results'} found in ${processingTimeMS}ms`;
							},
						}}
					/>
				</div>

				{/* Results grid */}
				<Hits
					hitComponent={Hit}
					classNames={{
						list: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
						item: '',
					}}
				/>

				{/* Pagination */}
				<div className="flex justify-center pt-4">
					<CustomPagination />
				</div>
			</div>
		</InstantSearchNext>
	);
}
