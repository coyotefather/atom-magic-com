/**
 * Categories.tsx
 *
 * Renders a grid of Codex category cards. Each card links to the category's
 * page (`/codex/categories/{slug}`) and shows the category name. Used on the
 * Codex landing page to show top-level categories, and inside the Category
 * component to show subcategories.
 *
 * Data is passed as a prop (fetched server-side via Payload Local API).
 *
 * Used by:
 *   - `src/app/(website)/codex/page.tsx`
 *   - `src/app/components/codex/Category.tsx`
 */
import type { Category as PayloadCategory } from '../../../../payload-types';
import ContentCard from '@/app/components/common/ContentCard';

const Categories = ({
	categories,
}: {
	categories: PayloadCategory[];
}) => {
	return (
		<section className="container px-6 md:px-8">
			<h3 className="marcellus text-2xl font-bold mb-6">Categories</h3>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{categories.map((c) => (
					<ContentCard
						key={c.id}
						title={c?.title ?? 'Category'}
						description={c?.description ?? ''}
						href={`/codex/categories/${c?.slug}`}
						variant="compact"
					/>
				))}
			</div>
		</section>
	);
};

export default Categories;
