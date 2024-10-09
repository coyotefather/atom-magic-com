import { QueryParams } from "next-sanity";
import { notFound } from "next/navigation";
import Header from '@/app/components/common/Header';
import { GEAR_PAGE_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/client";
import {
	GEAR_PAGE_QUERYResult,
} from "../../../../../../sanity.types";
import Gear from '@/app/components/codex/gear/Gear';

export default async function Page({ params }: { params: QueryParams }) {
	const gear = await sanityFetch<GEAR_PAGE_QUERYResult>({
		query: GEAR_PAGE_QUERY,
		params: params
	});
	if (!gear) {
		return notFound();
	}

	return (
		<main>
			<Header name={params.slug == "weapon" ? `Gear: ${params.slug}s` : `Gear: ${params.slug}`}>
 			All gear of this type available to characters.
			</Header>
			<Gear gear={gear} />
		</main>
	);
}