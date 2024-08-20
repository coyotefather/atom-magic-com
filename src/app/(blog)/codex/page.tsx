import Posts from "@/app/components/codex/Posts";
import Header from '@/app/components/common/Header';
import { sanityFetch } from "@/sanity/lib/client";
import { POSTS_QUERY } from "@/sanity/lib/queries";
import { POSTS_QUERYResult } from "../../../../sanity.types";

const Page = async () => {

	const posts = await sanityFetch<POSTS_QUERYResult>({
		query: POSTS_QUERY,
	});

	return (
		<main className="inconsolata">
			<Header name="Codex">
				  Create your player character and start your journey across the world of Solum.
			</Header>
			<Posts posts={posts} />
		</main>
	);
};

export default Page;