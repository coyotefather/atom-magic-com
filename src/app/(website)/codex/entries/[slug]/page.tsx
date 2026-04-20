export const revalidate = 3600

import { notFound } from 'next/navigation';
import { getPayloadClient } from '@/lib/payload';
import { UnifiedEntry } from '@/app/components/codex/UnifiedEntry';

const SEARCHABLE_COLLECTIONS = ['entries', 'creatures', 'disciplines', 'techniques', 'paths'] as const;
type SearchableCollection = typeof SEARCHABLE_COLLECTIONS[number];

async function findEntryBySlug(slug: string) {
	const payload = await getPayloadClient();
	const results = await Promise.all(
		SEARCHABLE_COLLECTIONS.map(collection =>
			payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 2 })
				.then(r => r.docs.length > 0 ? { doc: r.docs[0], type: collection as SearchableCollection } : null)
		)
	);
	return results.find(Boolean) ?? null;
}

export async function generateStaticParams() {
	const payload = await getPayloadClient();
	const slugs: { slug: string }[] = [];

	for (const collection of SEARCHABLE_COLLECTIONS) {
		const result = await payload.find({ collection, limit: 500, depth: 0 });
		for (const doc of result.docs) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const slug = (doc as any).slug;
			if (slug) slugs.push({ slug: String(slug) });
		}
	}

	return slugs;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const entry = await findEntryBySlug(slug);
	if (!entry) return notFound();

	return (
		<main>
			{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
			<UnifiedEntry entry={entry.doc as any} entryType={entry.type} />
		</main>
	);
}
