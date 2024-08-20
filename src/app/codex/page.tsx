import Posts from "@/app/components/codex/Posts";
import { sanityFetch } from "@/sanity/lib/client";
import { POSTS_QUERY } from "@/sanity/lib/queries";
import { POSTS_QUERYResult } from "../../../sanity.types";

const posts = await sanityFetch<POSTS_QUERYResult>({
	query: POSTS_QUERY,
  });

const Page = () => {

	return (
		<main className="inconsolata">
			<Posts posts={posts} />
		</main>
	);
};

export default Page;