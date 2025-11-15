// ./src/components/Post.tsx
import { CATEGORY_QUERYResult } from "../../../../sanity.types";
import Header from '@/app/components/common/Header';
import Entries from '@/app/components/codex/Entries';
import Categories from '@/app/components/codex/Categories';
import Link from "next/link";

export function Category({
		category
	}: {
		category: CATEGORY_QUERYResult
	}) {

	const { title, description, entries, children } = category || {};
	let allEntries = (<></>);
	let allChildren = (<></>);

	if(children && children.length > 0) {
		allChildren = (
			<Categories categories={children} />
		);
	}

	if(entries && entries.length > 0) {
		allEntries = <Entries entries={entries} />;
	}

  return (
	<article className="notoserif mx-auto prose prose-md max-w-none bg-white m-0">
		<Header name={title ? title : "Category"}>
			{description ? description : null}
		</Header>
		{allChildren}
		{allEntries}
		<section className="sunset-gradient mt-16">
			<div className="container py-4">
				<Link href="/codex">&larr; Return to Codex</Link>
			</div>
		</section>
	</article>
  );
}