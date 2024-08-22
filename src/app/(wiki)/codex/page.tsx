import Entries from "@/app/components/codex/Entries";
import Header from '@/app/components/common/Header';
import { sanityFetch } from "@/sanity/lib/client";
import { ENTRIES_QUERY } from "@/sanity/lib/queries";
import { ENTRIES_QUERYResult } from "../../../../sanity.types";

const Page = async () => {

	const entries = await sanityFetch<ENTRIES_QUERYResult>({
		query: ENTRIES_QUERY,
	});

	return (
		<main className="inconsolata">
			<Header name="Codex">
				  Create your player character and start your journey across the world of Solum.
			</Header>
			<Entries entries={entries} />
		</main>
	);
};

export default Page;