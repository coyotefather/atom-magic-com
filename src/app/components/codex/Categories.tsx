// ./src/components/Posts.tsx

import { CATEGORIES_QUERY_RESULT } from "../../../../sanity.types";
import CustomCard from '@/app/components/common/CustomCard';

const Categories = ({ categories }: { categories: CATEGORIES_QUERY_RESULT }) => {
  return (
	<section className="container">
		<h3 className="marcellus text-2xl font-bold">Categories</h3>
		<div className="grid grid-cols-3 gap-8">
			{categories.map((c) => (
				<CustomCard
					key={c._id}
					type="category"
					title={c?.title ? c?.title : "Title"}
					description={c?.description ? c?.description : "Description"}
					url={`/codex/categories/${c?.slug?.current}`}
					imagePath=""
					showImage={false} />
			))}
		</div>
	</section>
  );
}

export default Categories;