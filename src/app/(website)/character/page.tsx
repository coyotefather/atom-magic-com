/**
 * page.tsx — Character Manager (/character)
 *
 * Fetches all CMS character data server-side (cultures, paths, disciplines, etc.)
 * via `fetchCharacterData()` and passes it to the `<Sections />` wizard. A
 * `<LoadingPage />` overlay fades out once Redux hydrates from localStorage.
 * Revalidates every hour.
 */
export const revalidate = 3600

import Sections from '@/app/components/character/Sections';
import LoadingPage from '@/app/components/global/LoadingPage';
import { fetchCharacterData } from '@/lib/fetchCharacterData';

const Page = async () => {
	const data = await fetchCharacterData();

	return (
		<main>
			<LoadingPage />
			<Sections
				cultures={data.cultures}
				scores={data.scores}
				additionalScores={data.additionalScores}
				paths={data.paths}
				patronages={data.patronages}
				disciplines={data.disciplines}
			/>
		</main>
	);
};

export default Page;
