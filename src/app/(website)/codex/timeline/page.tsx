import { notFound } from "next/navigation";
import Header from '@/app/components/common/Header';
import { TIMELINE_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/client";
import {
	TIMELINE_QUERYResult,
} from "../../../../../sanity.types";
import Timeline from '@/app/components/codex/Timeline';

export default async function Page() {
	const timeline = await sanityFetch<TIMELINE_QUERYResult>({
		query: TIMELINE_QUERY,
	});
	if (!timeline) {
		return notFound();
	}

	return (
		<main>
			<Header name="Timeline">
 			A timeline of events on Solum, the world of Atom Magic.
			</Header>
			<Timeline timeline={timeline} />
		</main>
	);
}