/**
 * Entries.tsx
 *
 * Renders a grid of Codex entry cards. Reuses the Algolia `Hit` component for
 * each entry card even in non-search contexts, since Hit renders a consistent
 * entry card layout with icon, title, and description excerpt.
 *
 * Data is passed as a prop — the `type` field on each entry is used by Hit to
 * determine the icon and link path.
 *
 * Used by:
 *   - `src/app/components/codex/Category.tsx` (entries within a category)
 */
import Hit from '@/app/components/global/search/Hit';

interface EntryItem {
	id: string | number;
	title: string;
	slug: string;
	type: string;
}

const Entries = ({ entries }: { entries: EntryItem[] }) => {
	return (
		<section className="container px-6 md:px-8">
			<h3 className="marcellus text-2xl font-bold mb-6">Entries</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{entries.map((e, index) => (
					<Hit
						key={`entry_${index}`}
						hit={{
							type: 'entry',
							rev: '',
							title: e?.title ?? 'Title',
							path: e?.slug ?? '',
							description: '',
						}}
					/>
				))}
			</div>
		</section>
	);
};

export default Entries;
