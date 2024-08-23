// ./src/components/Posts.tsx

import { CATEGORIES_QUERYResult } from "../../../../sanity.types";
import {Card, CardHeader, CardBody} from "@nextui-org/card";
import Icon from '@mdi/react';
import { mdiFolderText } from '@mdi/js';

const Categories = ({ categories }: { categories: CATEGORIES_QUERYResult }) => {
  return (
	<section className="container">
		<h3 className="marcellus text-2xl font-bold">Categories</h3>
		<div className="flex flex-row gap-4">
			{categories.map((c) => (
				<Card shadow="sm" className="bg-sunset-gradient max-w-xs h-[200px] w-[300px]" key={c._id}>
					<CardHeader className="bg-black border-b-1 border-gold">
						<Icon
							className="text-gold align-center mr-2"
							path={mdiFolderText}
							size={2} />
						<a
							className="text-lg text-gold"
							href={`/codex/categories/${c?.slug?.current}`}
							>
							{c?.title}
						</a>
					</CardHeader>
					<CardBody className="bg-black text-white text-sm">
						<div className="my-auto">
							{c?.description}
						</div>
					</CardBody>
				</Card>
			))}
		</div>
	</section>
  );
}

export default Categories;