import CharacterGenerator from '@/app/components/character/CharacterGenerator';
import LoadingPage from '@/app/components/global/LoadingPage';
import { CHARACTER_MANAGER_QUERY } from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/client';
import { notFound } from 'next/navigation';
import { CHARACTER_MANAGER_QUERY_RESULT } from '../../../../sanity.types';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Character Generator | Atom Magic',
	description: 'Quickly generate characters for NPCs or as a starting point for your own creations in the world of Solum.',
};

const Page = async () => {
	const characterManager = await sanityFetch<CHARACTER_MANAGER_QUERY_RESULT>({
		query: CHARACTER_MANAGER_QUERY,
	});

	if (!characterManager) {
		return notFound();
	}

	return (
		<main>
			<LoadingPage />
			<CharacterGenerator
				cultures={characterManager.cultures}
				paths={characterManager.paths}
				patronages={characterManager.patronages}
				disciplines={characterManager.disciplines}
				scores={characterManager.scores}
			/>
		</main>
	);
};

export default Page;
