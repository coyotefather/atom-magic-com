// ./src/components/Entry.tsx
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";
import { ENTRY_QUERYResult } from "../../../../sanity.types";
import Link from "next/link";
import { Chip } from "@nextui-org/chip";
import {Card, CardHeader, CardFooter} from "@nextui-org/card";
import CategoryChip from '@/app/components/common/CategoryChip';


export function Entry({ entry }: { entry: ENTRY_QUERYResult }) {

  const { title, mainImage, body, author, publishedAt, categories } = entry || {};

  return (
	<article className="inconsolata mx-auto prose prose-md max-w-none bg-white m-0">
		<header className="container mt-16">
			<Card className="float-left m-0 w-1/3 mr-8 bg-sunset-gradient">
				<CardHeader className="bg-black absolute z-10 top-0 flex-col !items-start">
					{title ? <h1 className="marcellus text-white mb-0 w-full text-center">{title}</h1> : null}
				</CardHeader>
				{mainImage?.asset?._ref ? (
					<Image
						className="z-0 w-full h-full object-cover"
						src={urlFor(mainImage?.asset?._ref).quality(90).format('png').url()}
						width={300}
						height={300}
						alt={title || ""}
					/>
				) : null}
				<CardFooter className="bg-black text-white absolute z-10 bottom-0 flex-col !items-start">
					<div>
						Author: {author?.name ? author?.name : "An unknown scribe"}
					</div>
					<div>
						Last update: {publishedAt ? new Date(publishedAt).toDateString() : "Date unknown"}
					</div>
					<div className="flex gap-2 pb-4">
						Categories:
						{categories?.map( (c) => (
							<CategoryChip key={c?.title} category={c} />
						))}
					</div>
				</CardFooter>
			</Card>
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