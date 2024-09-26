import Header from '@/app/components/common/Header';
import Sections from '@/app/components/character/Sections';
import { CULTURES_QUERY, SCORES_QUERY, PATHS_QUERY, PATRONAGES_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import {
	CULTURES_QUERYResult,
	SCORES_QUERYResult,
	PATHS_QUERYResult,
	PATRONAGES_QUERYResult,
} from "../../../sanity.types";

const Page = async () => {
	const cultures = await sanityFetch<CULTURES_QUERYResult>({
		query: CULTURES_QUERY,
	});
	if (!cultures) {
		return notFound();
	}
	const scores = await sanityFetch<SCORES_QUERYResult>({
		query: SCORES_QUERY,
	});
	if (!scores) {
		return notFound();
	}
	const paths = await sanityFetch<PATHS_QUERYResult>({
		query: PATHS_QUERY,
	});
	if (!paths) {
		return notFound();
	}
	const patronages = await sanityFetch<PATRONAGES_QUERYResult>({
		query: PATRONAGES_QUERY,
	});
	if (!patronages) {
		return notFound();
	}

	return (
		<main className="notoserif">
			<Header name="Character Manager">
  				Create your player character and start your journey across the world of Solum.
			</Header>
			<Sections
				cultures={cultures}
				scores={scores}
				paths={paths}
				patronages={patronages} />
		</main>
	);
};

export default Page;