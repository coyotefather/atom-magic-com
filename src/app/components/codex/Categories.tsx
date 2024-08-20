// ./src/components/Posts.tsx

import { CATEGORIES_QUERYResult } from "../../../../sanity.types";

const Categories = ({ categories }: { categories: CATEGORIES_QUERYResult }) => {
  return (
	<ul className="mx-auto grid grid-cols-1 divide-y divide-blue-100">
	  {categories.map((category) => (
		<li key={category._id}>
		  <a
			className="block p-4 hover:bg-blue-50"
			href={`/codex/posts/${category?.slug?.current}`}
		  >
			{category?.title}
		  </a>
		</li>
	  ))}
	</ul>
  );
}

export default Categories;