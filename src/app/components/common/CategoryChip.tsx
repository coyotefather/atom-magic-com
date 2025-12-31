import { Slug } from "../../../../sanity.types";
import Link from "next/link";
import { Chip } from "@heroui/react";

const CategoryChip = ({
		category
	}: {
		category: {
			title: string | null,
			slug: Slug | null,
			chipColor: any
		}
	}) => {

	return (
		<Link href={`/codex/categories/${category?.slug?.current}`}>
			<Chip
				style={{ backgroundColor: `${category.chipColor.hex}`}}
				classNames={{
				base: `rounded-full hover:gold-gradient`,
				content: "text-black font-semibold hover:text-black hover:font-bold",
			  }}
			>
				{category?.title}
			</Chip>
		</Link>
	);
};

export default CategoryChip;