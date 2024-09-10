// ./src/components/Entry.tsx
import Image from "next/image";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { remarkExtendedTable } from 'remark-extended-table';
import remarkHeadingId from 'remark-heading-id';
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
			<div className="container grid grid-cols-3 gap-8 mt-8">
				<header>
					<Card className="w-full bg-sunset-gradient">
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
								{cardDetails?.map((d, index) => (
									<div key={`${d.detailName}-${index}`} className="flex flex-row py-1">
										<dt className="w-24 text-white mt-1">{d.detailName}</dt>
										<dd className="mt-1">{d.detailDescription}</dd>
									</div>
								))}
							</dl>
						</CardFooter>
					</Card>
				</header>
				<section className="col-span-2">
					<Markdown className="first-line:uppercase first-letter:text-6xl first-letter:float-left first-letter:bg-black first-letter:text-white first-letter:px-4 first-letter:mr-4 first-letter:mb-4 first-letter:rounded-md" remarkPlugins={[remarkGfm, remarkExtendedTable, [remarkHeadingId, {defaults: true, uniqueDefaults: true }]]}>{entryBody}</Markdown>
				</section>
			</div>
			<section className="bg-sunset-gradient mt-16">
				<div className="container py-4">
					<Link href="/codex">&larr; Return to Codex</Link>
				</div>
			</section>
		</article>
	);
}