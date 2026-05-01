/**
 * page.tsx — Character Generator (/generator)
 *
 * Fetches all CMS character data server-side and passes it to
 * `<CharacterGenerator />` for random NPC/starting-character generation.
 * A `<LoadingPage />` overlay covers the initial Redux hydration. Revalidates hourly.
 */
export const revalidate = 3600

import CharacterGenerator from '@/app/components/character/CharacterGenerator';
import LoadingPage from '@/app/components/global/LoadingPage';
import { fetchCharacterData } from '@/lib/fetchCharacterData';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Character Generator | Atom Magic',
	description: 'Quickly generate characters for NPCs or as a starting point for your own creations in the world of Solum.',
};

const Page = async () => {
	const data = await fetchCharacterData();

	return (
		<main>
			<LoadingPage />
			<CharacterGenerator
				cultures={data.cultures}
				paths={data.paths}
				patronages={data.patronages}
				disciplines={data.disciplines}
				scores={data.scores}
			/>
		</main>
	);
};

export default Page;
