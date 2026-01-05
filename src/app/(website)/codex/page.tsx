import Header from '@/app/components/common/Header';
import CustomCard from '@/app/components/common/CustomCard';
import { Search } from '@/app/components/global/search/Search';
// import { sanityFetch } from "@/sanity/lib/client";
// import { ENTRIES_QUERY } from "@/sanity/lib/queries";
// import { ENTRIES_QUERY_RESULT } from "../../../../sanity.types";

export const dynamic = 'force-dynamic';

const Page = async () => {

	// const entries = await sanityFetch<ENTRIES_QUERY_RESULT>({
	// 	query: ENTRIES_QUERY,
	// });

	return (
		<main className="notoserif">
			<Header name="Codex">
				Lore, rules and more about Atom Magic.
			</Header>
			<div className="my-16 container">
				<div className="grid grid-cols-4 gap-8">
					<div className="flex flex-col gap-4">
						<CustomCard
							type="category"
							title="Gameplay"
							description="Find everything you need to play a game of Atom Magic."
							url="/codex/categories/gameplay"
							imagePath="/Wheel_of_Cardinals.svg"
							showImage={true} />
						<CustomCard
							type="category"
							title="Lore"
							description="Delve deep into the lore of Atom Magic."
							url="/codex/categories/lore"
							imagePath="/Wheel_of_Cardinals.svg"
							showImage={true} />
						<CustomCard
							type="category"
							title="Timeline"
							description="Explore a timeline of events in the world of Solum."
							url="/codex/timeline"
							imagePath=""
							showImage={false} />
					</div>
					<div className="col-span-3">
						<Search />
					</div>
				</div>
			</div>
		</main>
	);
};

export default Page;