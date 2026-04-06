import { Suspense } from 'react';
import { fetchCharacterData } from '@/lib/fetchCharacterData';
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
	const data = await fetchCharacterData();

	return (
		<Suspense fallback={<LoadingState />}>
			<SharedCharacterPageContent
				cultures={data.cultures}
				paths={data.paths}
				patronages={data.patronages}
				disciplines={data.disciplines}
			/>
		</Suspense>
	);
}
