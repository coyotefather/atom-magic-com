import { Slug } from "../../../../sanity.types";
import Link from "next/link";
import { Chip } from "@nextui-org/chip";

const CategoryChip = ({
		category
	}: {
		category: {
			title: string | null,
			slug: Slug | null,
			chipColor: any
		}
	}) => {

	let backgroundClasses = `rounded-full bg-[${category.chipColor.hex}]`;

	return (
			<Link href={`/codex/categories/${category?.slug?.current}`}>
				<Chip
					classNames={{
					base: `${backgroundClasses} hover:bg-sunset-gradient`,
					content: "text-black font-semibold hover:text-black hover:font-bold",
			  	}}
				>
					{category?.title}
				</Chip>
			</Link>
	);
};

export default CategoryChip;