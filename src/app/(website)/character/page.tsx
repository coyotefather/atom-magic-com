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
