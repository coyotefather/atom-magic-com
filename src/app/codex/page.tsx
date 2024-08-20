import Posts from "@/app/components/codex/Posts";
import Header from '@/app/components/common/Header';
import Breadcrumbs from '@/app/components/common/Breadcrumbs';
import { sanityFetch } from "@/sanity/lib/client";
import { POSTS_QUERY } from "@/sanity/lib/queries";
import { POSTS_QUERYResult } from "../../../sanity.types";

const posts = await sanityFetch<POSTS_QUERYResult>({
	query: POSTS_QUERY,
  });

const Page = () => {

	return (
		<main className="inconsolata">
			<Header name="Codex">
				<Breadcrumbs
					page="Codex"
					parents={[]}
				/>
				  Create your player character and start your journey across the world of Solum.
			</Header>
			<Posts posts={posts} />
		</main>
	);
};

export default Page;