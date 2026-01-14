'use client';
import { Slug } from "../../../../sanity.types";
import Link from 'next/link';
import Markdown from 'react-markdown';
import Icon from '@mdi/react';
import { mdiCompass } from '@mdi/js';

export type EntryById = {
	title: string | null;
	description: string | null;
	slug: Slug | null;
} | null;

const DailyDiscovery = ({ entry }: { entry: EntryById }) => {
	const { title, description, slug } = entry || {};

	let text = description ? description.substring(0, 350) : "...";
	if (description && description.length > 350) {
		text += "...";
	}

	return (
		<section className="bg-white border-t-2 border-b-2 border-stone">
			<div className="container px-6 md:px-8 py-16 md:py-20">
				<div className="max-w-4xl mx-auto">
					{/* Section label */}
					<div className="flex items-center gap-3 mb-6">
						<Icon
							path={mdiCompass}
							size={0.875}
							className="text-gold"
						/>
						<span className="marcellus text-sm uppercase tracking-widest text-stone">
							Daily Discovery
						</span>
					</div>

					{/* Content */}
					<div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-start">
						<div>
							<h3 className="marcellus text-2xl md:text-3xl text-black mb-4 border-b-2 border-gold pb-3 inline-block">
								{title || "Codex Entry"}
							</h3>
							<div className="prose prose-stone prose-sm md:prose-base max-w-none">
								<Markdown>{text}</Markdown>
							</div>
						</div>

						<div className="md:pt-12">
							<Link
								href={`/codex/entries/${slug?.current}`}
								className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white marcellus uppercase tracking-widest text-sm font-bold hover:bg-stone-dark transition-colors no-underline whitespace-nowrap"
							>
								Read More
								<span>&rarr;</span>
							</Link>
						</div>
					</div>

					{/* Footer note */}
					<p className="mt-8 text-xs text-stone italic">
						A new entry is featured each day. Explore the Codex to discover more.
					</p>
				</div>
			</div>
		</section>
	);
};

export default DailyDiscovery;
