// ./src/components/Entry.tsx
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";
import { ENTRY_QUERYResult } from "../../../../sanity.types";
import Link from "next/link";
import { Chip } from "@nextui-org/chip";

export function Entry({ entry }: { entry: ENTRY_QUERYResult }) {
  const { title, mainImage, body, categories } = entry || {};

  return (
	<article className="inconsolata mx-auto prose prose-md max-w-none bg-white m-0">
		<header className="container mt-16">
			{title ? <h1 className="marcellus">{title}</h1> : null}
			<div className="flex gap-2 pb-4">
				{categories?.map( (c) => (
					<Chip key={c?.title}
					classNames={{
						base: "bg-sunset-gradient border-2 border-black",
						content: "text-black font-semibold",
					  }}
					>
						<Link href={`/codex/categories/${c?.slug?.current}`}>{c?.title}</Link>
					</Chip>
				))}
			</div>
			{mainImage?.asset?._ref ? (
				<Image
					className="float-right m-0 w-1/3 ml-4 rounded-lg"
					src={urlFor(mainImage?.asset?._ref).quality(90).format('png').url()}
					width={300}
					height={300}
					alt={title || ""}
				/>
			) : null}
		</header>
		<section className="container">
	  		{body ? <PortableText value={body} /> : null}
		</section>
		<section className="bg-sunset-gradient mt-16">
			<div className="container py-4">
				<Link href="/codex">&larr; Return to Codex</Link>
			</div>
		</section>
	</article>
  );
}