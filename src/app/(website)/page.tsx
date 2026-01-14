import Hero from '@/app/components/home/Hero';
import FeatureCards from '@/app/components/home/FeatureCards';
import DailyDiscovery from '@/app/components/home/DailyDiscovery';
import { notFound } from "next/navigation";
import { ENTRIES_COUNT_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import {
	ENTRIES_COUNT_QUERY_RESULT,
	Slug
} from "../../../sanity.types";
import { createHash } from 'crypto';
import Srand from 'seeded-rand';

export type EntryById = {
	title: string | null;
	description: string | null;
	slug: Slug | null;
} | null;

export default async function Home() {
	let total = await sanityFetch<ENTRIES_COUNT_QUERY_RESULT>({
		query: ENTRIES_COUNT_QUERY,
	});
	if (!total) {
		total = 5;
		return notFound();
	}

	// Generate a stable random number based on the current date
	const seed = createHash('sha1')
		.update(String(new Date().getDate().toString()))
		.digest()
		.readUInt32BE();
	const random = new Srand(seed).intInRange(1, total - 1);

	const entry = await sanityFetch<EntryById>({
		query: groq`*[_type == "entry"][${random}]{
			title, description, slug
		}`
	});
	if (!entry) {
		return notFound();
	}

	return (
		<main className="notoserif">
			<Hero />
			<FeatureCards />
			<DailyDiscovery entry={entry} />
		</main>
	);
}
