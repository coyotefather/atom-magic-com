import Header from '@/app/components/common/Header';
import Sections from '@/app/components/character/Sections';
import LoadingPage from '@/app/components/global/LoadingPage';
import {
	CHARACTER_MANAGER_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import {
	CHARACTER_MANAGER_QUERY_RESULT
} from "../../../../sanity.types";

const Page = async () => {
	const characterManager = await sanityFetch<CHARACTER_MANAGER_QUERY_RESULT>({
		query: CHARACTER_MANAGER_QUERY,
	});
	if (!characterManager) {
		return notFound();
	}

	return (
		<main className="notoserif">
			<LoadingPage />
			<Header name="Character Manager">
  				Create your player character and start your journey across the world of Solum.
			</Header>
			<Sections
				cultures={characterManager.cultures}
				scores={characterManager.scores}
				additionalScores={characterManager.additionalScores}
				paths={characterManager.paths}
				patronages={characterManager.patronages}
				disciplines={characterManager.disciplines}
				gear={characterManager.gear} />
		</main>
	);
};

export default Page;