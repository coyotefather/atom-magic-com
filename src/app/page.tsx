import Header from '@/app/components/common/Header';
import Cards from '@/app/components/home/Cards';
import RandomEntry from '@/app/components/home/RandomEntry';
import { notFound } from "next/navigation";
import { ENTRIES_COUNT_QUERY, ENTRY_BY_ID_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/client";
import {
	ENTRIES_COUNT_QUERYResult,
	ENTRY_BY_ID_QUERYResult
} from "../../sanity.types";
import Alea from 'alea';

export default async function Home() {
	let total = await sanityFetch<ENTRIES_COUNT_QUERYResult>({
		query: ENTRIES_COUNT_QUERY,
	});
	if (!total) {
		total = 5;
		return notFound();
	}
	const arng = Alea(new Date().getTime());
	const random = Math.ceil( arng.next() * total );
	let entry = await sanityFetch<ENTRY_BY_ID_QUERYResult>({
		query: ENTRY_BY_ID_QUERY,
		params: { entryId: random }
	});
	if(!entry) {
		return notFound();
	}

	const { _id, title, entryBody, slug } = entry || {};

	return (
		<main className="notoserif">
			<Header name="Home">
				Some text {random} - {_id}
			</Header>
			<div className="container">
				<div className="grid grid-cols-2">
					<div></div>
					<RandomEntry title={title} entryBody={entryBody} slug={slug} />
				</div>
				<Cards />
			</div>
		</main>
	);
}
