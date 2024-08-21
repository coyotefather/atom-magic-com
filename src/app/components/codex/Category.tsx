// ./src/components/Post.tsx
import { CATEGORY_QUERYResult } from "../../../../sanity.types";
import Link from "next/link";

export function Category({
		category
	}: {
		category: CATEGORY_QUERYResult
	}) {

	const { title, description, posts, children } = category || {};
	let allPosts = (<></>);
	let allChildren = (<></>);

	if(children) {
		allChildren = (
			<>
				{children.map((c) => (
					<li key={c._id}>
						<div>
							<a
								className="block p-4 hover:bg-blue-50"
								href={`/codex/categories/${c?.slug?.current}`}
								>
								{c?.title}
							</a>
						</div>
						<div>
							{c?.description}
						</div>
					</li>
				))}
			</>
		);
	}

	if(posts) {
		allPosts = (
			<>
				{posts.map((p) => (
					<li key={p._id}>
						<a
							className="block p-4 hover:bg-blue-50"
							href={`/codex/posts/${p?.slug?.current}`}
							>
							{p?.title}
						</a>
					</li>
				))}
			</>
		);
	}

  return (
	<article className="inconsolata mx-auto prose prose-md max-w-none bg-white m-0">
		<div className="bg-sunset-gradient mb-4">&nbsp;
		</div>
		<header className="container pt-4">
			{title ? <h1 className="marcellus">{title}</h1> : null}
		</header>
		<section className="container">
	  		{description ? description : null}
		</section>
		<section className="container">
			<h3 className="marcellus text-lg font-bold">Sub-categories</h3>
			<ul>
				{allChildren}
			</ul>
		</section>
		<section className="container">
			<h3 className="marcellus text-lg font-bold">All articles</h3>
			<ul>
				{allPosts}
			</ul>
		</section>
		<section className="bg-sunset-gradient">
			<div className="container py-4">
				<Link href="/codex">&larr; Return to Codex</Link>
			</div>
		</section>
	</article>
  );
}