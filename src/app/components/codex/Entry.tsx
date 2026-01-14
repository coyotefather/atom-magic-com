'use client';
import Image from 'next/image';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { remarkExtendedTable } from 'remark-extended-table';
import { remarkDefinitionList } from 'remark-definition-list';
import remarkHeadingId from 'remark-heading-id';
import { urlFor } from '@/sanity/lib/image';
import { ENTRY_QUERY_RESULT } from '../../../../sanity.types';
import Link from 'next/link';
import Breadcrumbs from '@/app/components/common/Breadcrumbs';
import TableOfContents from '@/app/components/codex/TableOfContents';
import Icon from '@mdi/react';
import { mdiArrowLeft } from '@mdi/js';

export function Entry({ entry }: { entry: ENTRY_QUERY_RESULT }) {
	const {
		title,
		mainImage,
		cardDetails,
		entryBody,
		toc,
		author,
		publishedAt,
		category,
	} = entry || {};

	let parents = [{ title: 'Home', url: '/' }];

	if (category) {
		if (category.parent) {
			if (category.parent.parent) {
				if (category.parent.parent.parent) {
					parents.push({
						title: '' + category.parent.parent.parent.title,
						url:
							'/codex/categories/' +
							category.parent.parent.parent?.slug?.current,
					});
				}
				parents.push({
					title: '' + category.parent.parent.title,
					url: '/codex/categories/' + category.parent.parent?.slug?.current,
				});
			}
			parents.push({
				title: '' + category.parent.title,
				url: '/codex/categories/' + category.parent?.slug?.current,
			});
		}
		parents.push({
			title: '' + category.title,
			url: '/codex/categories/' + category?.slug?.current,
		});
	}

	return (
		<article className="notoserif bg-white">
			{/* Breadcrumb bar */}
			<div className="bg-black border-b-2 border-gold">
				<div className="container px-6 md:px-8 py-4">
					<Breadcrumbs currentPage={title ?? ''} parents={parents} />
				</div>
			</div>

			{/* Main content area */}
			<div className="container px-6 md:px-8 py-8 md:py-12">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Sidebar */}
					<aside className="md:order-first order-last">
						<div className="border-2 border-stone bg-parchment sticky top-4">
							{/* Gold accent line */}
							<div className="h-1 bg-gold" />

							{/* Image */}
							{mainImage?.asset?._ref && (
								<div className="border-b-2 border-stone">
									<Image
										className="w-full h-48 object-cover"
										src={urlFor(mainImage.asset._ref).quality(75).url()}
										width={300}
										height={200}
										alt={title || ''}
									/>
								</div>
							)}

							{/* Content */}
							<div className="p-4">
								{/* Table of Contents */}
								{toc && (
									<div className="mb-4">
										<TableOfContents toc={toc} />
									</div>
								)}

								{/* Details */}
								<dl className="divide-y divide-stone/30 text-sm">
									{cardDetails?.map((d, index) => (
										<div
											key={`${d.detailName}-${index}`}
											className="flex flex-col py-2 first:pt-0"
										>
											<dt className="text-stone text-xs uppercase tracking-wider mb-1">
												{d.detailName}
											</dt>
											<dd className="text-black">{d.detailDescription}</dd>
										</div>
									))}
									<div className="flex flex-col py-2">
										<dt className="text-stone text-xs uppercase tracking-wider mb-1">
											Author
										</dt>
										<dd className="text-black">
											{author?.name ?? 'An unknown scribe'}
										</dd>
									</div>
									<div className="flex flex-col py-2">
										<dt className="text-stone text-xs uppercase tracking-wider mb-1">
											Last Updated
										</dt>
										<dd className="text-black">
											{publishedAt
												? new Date(publishedAt).toLocaleDateString('en-US', {
														year: 'numeric',
														month: 'long',
														day: 'numeric',
													})
												: 'Date unknown'}
										</dd>
									</div>
								</dl>
							</div>
						</div>
					</aside>

					{/* Main content */}
					<section className="md:col-span-2">
						<h1 className="marcellus text-3xl md:text-4xl text-black mb-6 pb-4 border-b-2 border-gold">
							{title}
						</h1>
						<div className="prose prose-stone prose-lg max-w-none first-letter:text-4xl first-letter:font-bold first-letter:mr-1 first-letter:float-left first-letter:marcellus">
							<Markdown
								remarkPlugins={[
									remarkGfm,
									remarkExtendedTable,
									remarkDefinitionList,
									[remarkHeadingId, { defaults: true, uniqueDefaults: true }],
								]}
							>
								{entryBody}
							</Markdown>
						</div>
					</section>
				</div>
			</div>

			{/* Footer */}
			<section className="bg-parchment border-t-2 border-stone">
				<div className="container px-6 md:px-8 py-6">
					<Link
						href="/codex"
						className="inline-flex items-center gap-2 text-stone hover:text-gold transition-colors no-underline"
					>
						<Icon path={mdiArrowLeft} size={0.875} />
						<span className="marcellus uppercase tracking-wider text-sm">
							Return to Codex
						</span>
					</Link>
				</div>
			</section>
		</article>
	);
}
