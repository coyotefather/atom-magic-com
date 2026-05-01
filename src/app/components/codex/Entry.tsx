/**
 * Entry.tsx
 *
 * Full page view for a single Codex entry (a lore article). Renders:
 * - Breadcrumb navigation back to the entry's parent category
 * - Main image (if present, from Vercel Blob via depth-resolved Media relation)
 * - Entry title and optional table of contents (Lexical rich text)
 * - Entry body (Lexical rich text via `<RichText />`)
 * - Linked discipline, technique, path, or culture references as chips
 *
 * Data is passed as a fully resolved Payload Entry document (depth: 2).
 *
 * Used by:
 *   - `src/app/(website)/codex/entries/[slug]/page.tsx`
 */
import Image from 'next/image';
import Link from 'next/link';
import { RichText } from '@/app/components/common/RichText';
import type { Entry as PayloadEntry, Category, Media } from '../../../../payload-types';
import Breadcrumbs from '@/app/components/common/Breadcrumbs';
import TableOfContents from '@/app/components/codex/TableOfContents';
import Icon from '@mdi/react';
import { mdiArrowLeft } from '@mdi/js';

export function Entry({ entry }: { entry: PayloadEntry }) {
	if (!entry) return null;

	const {
		title,
		mainImage,
		cardDetails,
		entryBody,
		toc,
		author,
		publishedAt,
		category,
	} = entry;

	const image = mainImage && typeof mainImage === 'object' ? mainImage as Media : null;
	const cat = category && typeof category === 'object' ? category as Category : null;
	const authorObj = author && typeof author === 'object' ? author : null;

	const parents = [{ title: 'Home', url: '/' }];
	if (cat) {
		const walkCat = (c: Category) => {
			if (c.parent && typeof c.parent === 'object') walkCat(c.parent as Category);
			parents.push({ title: c.title, url: `/codex/categories/${c.slug}` });
		};
		if (cat.parent && typeof cat.parent === 'object') walkCat(cat.parent as Category);
		parents.push({ title: cat.title, url: `/codex/categories/${cat.slug}` });
	}

	return (
		<article className="notoserif bg-white">
			<div className="bg-black border-b-2 border-gold">
				<div className="container px-6 md:px-8 py-4">
					<Breadcrumbs currentPage={title ?? ''} parents={parents} />
				</div>
			</div>

			<div className="container px-6 md:px-8 py-8 md:py-12">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<aside className="md:order-first order-last">
						<div className="border-2 border-stone bg-parchment sticky top-4">
							<div className="h-1 bg-gold" />
							{image?.url && (
								<div className="border-b-2 border-stone">
									<Image
										className="w-full h-48 object-cover"
										src={image.url}
										width={300}
										height={200}
										alt={title || ''}
									/>
								</div>
							)}
							<div className="p-4">
								{toc && <div className="mb-4"><TableOfContents toc={toc} /></div>}
								<dl className="divide-y divide-stone/30 text-sm">
									{cardDetails?.map((d, index) => (
										<div key={`${d.detailName}-${index}`} className="flex flex-col py-2 first:pt-0">
											<dt className="text-stone text-xs uppercase tracking-wider mb-1">{d.detailName}</dt>
											<dd className="text-black">{d.detailDescription}</dd>
										</div>
									))}
									<div className="flex flex-col py-2">
										<dt className="text-stone text-xs uppercase tracking-wider mb-1">Author</dt>
										<dd className="text-black">{authorObj?.name ?? 'An unknown scribe'}</dd>
									</div>
									<div className="flex flex-col py-2">
										<dt className="text-stone text-xs uppercase tracking-wider mb-1">Last Updated</dt>
										<dd className="text-black">
											{publishedAt
												? new Date(publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
												: 'Date unknown'}
										</dd>
									</div>
								</dl>
							</div>
						</div>
					</aside>

					<section className="md:col-span-2">
						<h1 className="marcellus text-3xl md:text-4xl text-black mb-6 pb-4 border-b-2 border-gold">{title}</h1>
						<div className="prose prose-stone prose-lg max-w-none first-letter:text-4xl first-letter:font-bold first-letter:mr-1 first-letter:float-left first-letter:marcellus">
							<RichText content={entryBody} />
						</div>
					</section>
				</div>
			</div>

			<section className="bg-parchment border-t-2 border-stone">
				<div className="container px-6 md:px-8 py-6">
					<Link href="/codex" className="inline-flex items-center gap-2 text-stone hover:text-gold transition-colors no-underline">
						<Icon path={mdiArrowLeft} size={0.875} />
						<span className="marcellus uppercase tracking-wider text-sm">Return to Codex</span>
					</Link>
				</div>
			</section>
		</article>
	);
}
