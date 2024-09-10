'use client';
import  algoliasearch from 'algoliasearch';
//import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Hits, Stats } from 'react-instantsearch';
import { InstantSearchNext } from 'react-instantsearch-nextjs';
import Hit from '@/app/components/global/search/Hit';
import CustomSearchBox from '@/app/components/global/search/CustomSearchBox';
import CustomPagination from '@/app/components/global/search/CustomPagination';
import CustomHitsPerPage from '@/app/components/global/search/CustomHitsPerPage';

const searchClient = algoliasearch('578IHPAJAF', '59762a6202a01eaa2723bf1033011e39');

export function Search() {
	return (
		<div>
			<InstantSearchNext
				indexName="entries"
				future={{ preserveSharedStateOnUnmount: false, }}
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
				}
				}}>
				<div className="flex gap-16 items-center w-full">
					<CustomSearchBox />
					<CustomHitsPerPage items={[
						{ label: '10 hits per page', value: 10, default: true },
						{ label: '25 hits per page', value: 25 },
						{ label: '50 hits per page', value: 50 },
						]} />
				</div>
				<div className="mt-8 mb-8">
					<Stats className="text-sm"/>
				</div>
				<div className="mt-8 mb-8 flex flex-col divide-y">
					<Hits hitComponent={Hit} />
				</div>
				<div className="flex items-center justify-center">
					<CustomPagination  />
				</div>
			</InstantSearchNext>
		</div>
	);
}
