// ./src/components/Post.tsx
import { CATEGORY_QUERYResult } from "../../../../sanity.types";
import Link from "next/link";

export function Category({ category }: { category: CATEGORY_QUERYResult }) {

  const { title, description, posts } = category || {};
  let allPosts = (<></>);

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