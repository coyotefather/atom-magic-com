// ./src/components/Entry.tsx
'use client';
import Image from "next/image";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { remarkExtendedTable } from 'remark-extended-table';
import { remarkDefinitionList } from 'remark-definition-list';
import remarkHeadingId from 'remark-heading-id';
import { urlFor } from "@/sanity/lib/image";
import { ENTRY_QUERYResult } from "../../../../sanity.types";
import Link from "next/link";
//import {Card, CardHeader, CardFooter} from "@heroui/card";
import {Card, CardHeader, CardFooter} from "@heroui/react";
import Breadcrumbs from '@/app/components/common/Breadcrumbs';
import TableOfContents from '@/app/components/codex/TableOfContents';
import clsx from 'clsx';

export function Entry({ entry }: { entry: ENTRY_QUERYResult }) {

	const { title, mainImage, cardDetails, entryBody, toc, author, publishedAt, category } = entry || {};

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
		<article className="notoserif mx-auto max-w-none bg-white m-0">
			<div className="trapezoid-bar z-1 py-4 bg-black">
				<div className="container mt-4">
					<Breadcrumbs currentPage={title ? title : ""} parents={parents} />
				</div>
			</div>
			<div className="container mt-8 grid grid-cols-3 gap-4">
				<div className="md:ml-8">
					<Card radius="none" shadow="none" className="w-full z-10 trapezoid-bar-reverse trapezoid-top-bar-reverse bg-black text-white overflow-visible">
						<CardHeader className={clsx(
							"flex-col items-start!",
							{ 'z-10 top-0': mainImage?.asset?._ref }
						)}>
						</CardHeader>
						{mainImage?.asset?._ref ? (
							<Image
								className="z-0 w-full max-h-48 h-full not-prose object-cover"
								src={urlFor(mainImage?.asset?._ref).quality(75).url()}
								width={300}
								height={300}
								alt={title || ""}
							/>
						) : null }
						<CardFooter className={clsx(
							"flex-col items-start!",
							{ 'z-10 bottom-0': mainImage?.asset?._ref }
						)}>
							{ toc ? <TableOfContents toc={toc} /> : ""}
							<dl className="divide-y w-full my-0 not-prose">
								{cardDetails?.map((d, index) => (
									<div key={`${d.detailName}-${index}`} className="flex flex-row py-1">
										<dt className="w-36 text-white mt-1">{d.detailName}:</dt>
										<dd className="mt-1">{d.detailDescription}</dd>
									</div>
								))}
								<div className="flex flex-row py-1">
									<dt className="w-36 mt-1">Author:</dt>
									<dd className="mt-1">{author?.name ? author?.name : "An unknown scribe"}</dd>
								</div>
								<div className="flex flex-row py-1">
									<dt className="w-36 mt-1">Last update:</dt>
									<dd className="mt-1">{publishedAt ? new Date(publishedAt).toDateString() : "Date unknown"}</dd>
								</div>
							</dl>
						</CardFooter>
					</Card>
				</div>
				<section className="col-span-2">
					<div className="first-line:uppercase first-line:marcellus prose prose-md">
						<Markdown remarkPlugins={[remarkGfm, remarkExtendedTable, remarkDefinitionList, [remarkHeadingId, {defaults: true, uniqueDefaults: true }]]}>{entryBody}</Markdown>
					</div>
				</section>
			</div>
			<section className="bg-gradient trapezoid-bar-reverse mt-16">
				<div className="container py-4">
					<Link href="/codex">&larr; Return to Codex</Link>
				</div>
			</section>
		</article>
	);
}