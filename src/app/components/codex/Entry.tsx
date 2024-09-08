// ./src/components/Entry.tsx
import Image from "next/image";
import Markdown from 'react-markdown'
import { urlFor } from "@/sanity/lib/image";
import { ENTRY_QUERYResult } from "../../../../sanity.types";
import Link from "next/link";
import {Card, CardHeader, CardFooter} from "@nextui-org/card";
import Breadcrumbs from '@/app/components/common/Breadcrumbs';
import clsx from 'clsx';

export function Entry({ entry }: { entry: ENTRY_QUERYResult }) {

	const { title, mainImage, cardDetails, entryBody, author, publishedAt, category } = entry || {};

	let parents = [
		{ title: "Home", url: "/" }
	];

	if(category) {
		if(category.parent) {
  			if(category.parent.parent) {
				if(category.parent.parent.parent) {
					parents.push({ title: "" + category.parent.parent.parent.title, url: "/codex/categories/" + category.parent.parent.parent?.slug?.current });
				}
				parents.push({ title: "" + category.parent.parent.title, url: "/codex/categories/" + category.parent.parent?.slug?.current });
			}
			parents.push({ title: "" + category.parent.title, url: "/codex/categories/" + category.parent?.slug?.current });
		}
		parents.push({ title: "" + category.title, url: "/codex/categories/" + category?.slug?.current });
	}

	return (
		<article className="inconsolata mx-auto prose prose-md max-w-none bg-white m-0">
			<div className="bg-sunset-gradient">
				<div className="container py-4">
					<Breadcrumbs currentPage={title ? title : ""} parents={parents} />
				</div>
			</div>
			<header className="container mt-8">
				<Card className="float-left m-0 w-1/3 mr-8 bg-sunset-gradient">
					<CardHeader className={clsx(
						"bg-black flex-col !items-start",
						{ 'absolute z-10 top-0': mainImage?.asset?._ref }
					)}>
						{title ? <h1 className="marcellus text-white mb-0 w-full text-center">{title}</h1> : null}
					</CardHeader>
					{mainImage?.asset?._ref ? (
						<Image
							className="z-0 w-full h-full object-cover"
							src={urlFor(mainImage?.asset?._ref).quality(75).url()}
							width={300}
							height={300}
							alt={title || ""}
						/>
					) : null }
					<CardFooter className={clsx(
						"bg-black text-white flex-col !items-start",
						{ 'absolute z-10 bottom-0': mainImage?.asset?._ref }
					)}>
						<dl className="divide-y w-full my-0">
							<div className="flex flex-row py-1">
								<dt className="w-24 text-white mt-1">Author</dt>
								<dd className="mt-1">{author?.name ? author?.name : "An unknown scribe"}</dd>
							</div>
							<div className="flex flex-row py-1">
								<dt className="w-24 text-white mt-1">Last update</dt>
								<dd className="mt-1">{publishedAt ? new Date(publishedAt).toDateString() : "Date unknown"}</dd>
							</div>
							{cardDetails?.map((d) => (
								<div className="flex flex-row py-1">
									<dt className="w-24 text-white mt-1">{d.detailName}</dt>
									<dd className="mt-1">{d.detailDescription}</dd>
								</div>
							))}
						</dl>
					</CardFooter>
				</Card>
			</header>
			<section className="container">
				<Markdown>{entryBody}</Markdown>
			</section>
			<section className="bg-sunset-gradient mt-16">
				<div className="container py-4">
					<Link href="/codex">&larr; Return to Codex</Link>
				</div>
			</section>
		</article>
	);
}