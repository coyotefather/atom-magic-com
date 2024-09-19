import Header from '@/app/components/common/Header';
import Cards from '@/app/components/home/Cards';
import RandomEntry from '@/app/components/home/RandomEntry';
import NextImage from "next/image";
import { notFound } from "next/navigation";
import { ENTRIES_COUNT_QUERY, ENTRY_BY_ID_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import {
	ENTRIES_COUNT_QUERYResult,
	Slug
} from "../../sanity.types";
//import Alea from 'alea';
import {
  createHash,
} from 'crypto';
import Srand from 'seeded-rand';

export type EntryById = {
  title: string | null;
  entryBody: string | null;
  slug: Slug | null;
} | null;

export default async function Home() {
	let total = await sanityFetch<ENTRIES_COUNT_QUERYResult>({
		query: ENTRIES_COUNT_QUERY,
	});
	if (!total) {
		total = 5;
		return notFound();
	}

	// source: https://stackoverflow.com/questions/63598818/how-to-get-a-stable-random-number-in-a-range-given-a-seed

	const seed = createHash('sha1').update(String(new Date().getDate().toString())).digest().readUInt32BE();
	const random = new Srand(seed).intInRange(1, total - 1);

	const entry = await sanityFetch<EntryById>({
		query: groq`*[_type == "entry"][${random}]{
		  title, entryBody, slug
		}`
	});
	if(!entry) {
		return notFound();
	}

	return (
		<main className="notoserif">
			<Header name="Home">
				Some text {random}
			</Header>
			<div className="border-b-2 relative">
				<div className="grid grid-cols-2 divide-x-2">
					<div className="bg-black text-white pl-48">
						<div className="pr-8 mt-8">
							<h2 className="marcellus text-3xl">Lorem ipsum</h2>
							<div></div>
						</div>
					</div>
					<RandomEntry entry={entry} />
				</div>
				<div className="rounded-full z-10 absolute z-2 -bottom-[24px] border-black bg-white ml-auto mr-auto w-[48px] h-[48px] border-2 left-0 right-0">
					<NextImage
						className="bg-white rounded-full m-auto absolute top-0 bottom-0 right-0 left-0"
						width={20}
						height={20}
						src="/atom-magic-circle-black.png"
						alt="Review Below Section" />
				</div>
			</div>
			<div className="container">
				<Cards />
			</div>
		</main>
	);
}
