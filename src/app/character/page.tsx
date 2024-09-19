import Header from '@/app/components/common/Header';
import Sections from '@/app/components/character/Sections';
import { CULTURES_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import {
	CULTURES_QUERYResult,
} from "../../../sanity.types";


const Page = async () => {
	const cultures = await sanityFetch<CULTURES_QUERYResult>({
		query: CULTURES_QUERY,
	});
	if (!cultures) {
		return notFound();
	}

	return (
		<main className="notoserif">
			<Header name="Character Manager">
  				Create your player character and start your journey across the world of Solum.
			</Header>
			<Sections
				cultures={cultures} />
		</main>
	);
};

export default Page;