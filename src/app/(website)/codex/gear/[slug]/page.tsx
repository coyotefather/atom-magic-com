//import { QueryParams } from "next-sanity";
import { notFound } from "next/navigation";
import Header from '@/app/components/common/Header';
import { GEAR_PAGE_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/client";
import {
	GEAR_PAGE_QUERYResult,
} from "../../../../../../sanity.types";
import Gear from '@/app/components/codex/gear/Gear';

type QueryParams = Promise<{ slug: string }>

export default async function Page({ params }: { params: QueryParams }) {
	const { slug } = await params;
	const gear = await sanityFetch<GEAR_PAGE_QUERYResult>({
		query: GEAR_PAGE_QUERY,
		params: params
	});
	if (!gear) {
		return notFound();
	}

	return (
		<main>
			<Header name={slug == "weapon" ? `Gear: ${slug}s` : `Gear: ${slug}`}>
 			All gear of this type available to characters.
			</Header>
			<Gear gear={gear} />
		</main>
	);
}