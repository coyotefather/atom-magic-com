import { CATEGORIES_QUERY_RESULT } from '../../../../sanity.types';
import ContentCard from '@/app/components/common/ContentCard';

const Categories = ({
	categories,
}: {
	categories: CATEGORIES_QUERY_RESULT;
}) => {
	return (
		<section className="container px-6 md:px-8">
			<h3 className="marcellus text-2xl font-bold mb-6">Categories</h3>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{categories.map((c) => (
					<ContentCard
						key={c._id}
						title={c?.title ?? 'Category'}
						description={c?.description ?? ''}
						href={`/codex/categories/${c?.slug?.current}`}
						variant="compact"
					/>
				))}
			</div>
		</section>
	);
};

export default Categories;
