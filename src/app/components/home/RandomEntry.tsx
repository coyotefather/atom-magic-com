/**
 * RandomEntry.tsx
 *
 * Homepage section that shows a random Codex entry selected server-side. Renders
 * the entry title and up to 300 characters of its description (with ellipsis if
 * truncated) as a link to the full entry.
 *
 * Very similar to DailyDiscovery but without the compass icon and with a slightly
 * shorter excerpt length.
 *
 * Used by:
 *   - `src/app/(website)/page.tsx` (homepage, currently may be unused or replaced)
 */
'use client';
import Markdown from 'react-markdown'

export type EntryById = {
  title: string | null;
  description: string | null;
  slug: string | null;
} | null;

const RandomEntry = ({
		entry
	}:{
		entry: EntryById
	}) => {

	const { title, description, slug } = entry || {};

	let text = description ? description.substring(0, 300) : "...";
	if(description && description.length > 300) {
		text += "...";
	}

	return (
		<div className="p-8 pr-48">
			<h2 className="marcellus text-3xl mb-4">Today&apos;s Codex Entry: {title ? title : "not found"}</h2>
			<div className="not-prose">
				<Markdown>
					{text}
				</Markdown>
			</div>
			<a className="block my-8" href={`/codex/entries/${slug}`}>
				<button
					className="gold-gradient font-extrabold uppercase tracking-widest p-2 pl-4 pr-4 border-black border-2"
					type="button">
					Read More
				</button>
			</a>
		</div>
	);
}

export default RandomEntry;