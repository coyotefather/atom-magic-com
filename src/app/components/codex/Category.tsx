import { CATEGORY_QUERY_RESULT } from '../../../../sanity.types';
import Header from '@/app/components/common/Header';
import Entries from '@/app/components/codex/Entries';
import Categories from '@/app/components/codex/Categories';
import Link from 'next/link';
import Icon from '@mdi/react';
import { mdiArrowLeft } from '@mdi/js';

export function Category({ category }: { category: CATEGORY_QUERY_RESULT }) {
	const { title, description, entries, children } = category || {};

	return (
		<article className="notoserif bg-white">
			<Header name={title ?? 'Category'}>{description ?? null}</Header>

			<div className="py-8 md:py-12">
				{/* Child categories */}
				{children && children.length > 0 && (
					<div className="mb-12">
						<Categories categories={children} />
					</div>
				)}

				{/* Entries */}
				{entries && entries.length > 0 && <Entries entries={entries} />}

				{/* Empty state */}
				{(!children || children.length === 0) &&
					(!entries || entries.length === 0) && (
						<div className="container px-6 md:px-8 text-center py-12">
							<p className="text-stone-dark">
								No entries found in this category yet.
							</p>
						</div>
					)}
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
