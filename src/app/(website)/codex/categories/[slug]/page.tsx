export const revalidate = 3600

import { notFound } from 'next/navigation';
import { getPayloadClient } from '@/lib/payload';
import { Category } from '@/app/components/codex/Category';

export async function generateStaticParams() {
	const payload = await getPayloadClient();
	const result = await payload.find({ collection: 'categories', limit: 100, depth: 0 });
	return result.docs.map(cat => ({ slug: cat.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const payload = await getPayloadClient();

	const result = await payload.find({
		collection: 'categories',
		where: { slug: { equals: slug } },
		limit: 1,
		depth: 2,
	});

	if (!result.docs.length) return notFound();
	const category = result.docs[0];

	// Find child categories
	const childrenResult = await payload.find({
		collection: 'categories',
		where: { parent: { equals: category.id } },
		limit: 50,
		depth: 0,
	});

	// Find all entries in this category across collections in parallel
	const SEARCHABLE_COLLECTIONS = ['entries', 'creatures', 'disciplines', 'techniques', 'paths'] as const;
	const colResults = await Promise.all(
		SEARCHABLE_COLLECTIONS.map(col =>
			payload.find({ collection: col, where: { category: { equals: category.id } }, limit: 96, depth: 0 })
				.then(r => r.docs.map(doc => {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const d = doc as any;
					return { id: doc.id, title: d.title ?? d.name ?? '', slug: d.slug ?? '', type: col };
				}))
		)
	);
	const entries: Array<{ id: string | number; title: string; slug: string; type: string }> = colResults.flat();

	return (
		<main>
			<Category
				category={category}
				children={childrenResult.docs}
				entries={entries}
			/>
		</main>
	);
}
