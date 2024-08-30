import Header from '@/app/components/common/Header';
import CustomCard from '@/app/components/common/CustomCard';
// import { sanityFetch } from "@/sanity/lib/client";
// import { ENTRIES_QUERY } from "@/sanity/lib/queries";
// import { ENTRIES_QUERYResult } from "../../../../sanity.types";

const Page = async () => {

	// const entries = await sanityFetch<ENTRIES_QUERYResult>({
	// 	query: ENTRIES_QUERY,
	// });

	return (
		<main className="inconsolata">
			<Header name="Codex">
				Lore, rules and more about Atom Magic.
			</Header>
			<div className="my-16 container">
				<CustomCard
					type="category"
					title="Lore"
					description="Delve deep into the lore of Atom Magic."
					url="/codex/categories/lore"
					imagePath="/Wheel_of_Cardinals.svg"
					showImage={true} />
			</div>
		</main>
	);
};

export default Page;