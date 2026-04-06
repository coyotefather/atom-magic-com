import { algoliasearch } from 'algoliasearch';
import { getPayloadClient } from '@/lib/payload';

const algoliaClient = algoliasearch(
	process.env.ALGOLIA_APP_ID!,
	process.env.ALGOLIA_API_KEY!,
);
const indexName = process.env.ALGOLIA_INDEX_NAME!;

const SEARCHABLE_COLLECTIONS = ['entries', 'creatures', 'disciplines', 'techniques', 'paths'] as const;

async function performBulkReindex() {
	const payload = await getPayloadClient();
	const records: Record<string, unknown>[] = [];

	for (const collection of SEARCHABLE_COLLECTIONS) {
		const result = await payload.find({ collection, limit: 500, depth: 0 });
		for (const doc of result.docs) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const d = doc as any;
			records.push({
				objectID: String(doc.id),
				title: d.title ?? d.name ?? '',
				path: d.slug ?? '',
				description: d.description ?? '',
				documentType: collection,
			});
		}
	}

	await algoliaClient.saveObjects({ indexName, objects: records });

	return { message: `Bulk reindex complete. Indexed ${records.length} documents.` };
}

export async function POST(request: Request) {
	try {
		const { searchParams } = new URL(request.url);

		if (searchParams.get('reindex') === 'true') {
			const adminSecret = searchParams.get('secret');
			if (!adminSecret || adminSecret !== process.env.ALGOLIA_ADMIN_SECRET) {
				return Response.json({ error: 'Unauthorized' }, { status: 401 });
			}
			const response = await performBulkReindex();
			return Response.json(response);
		}

		return Response.json({ error: 'Unknown action' }, { status: 400 });
	} catch (error) {
		console.error('Algolia reindex error:', error instanceof Error ? error.message : 'Unknown error');
		return Response.json({ error: 'Error indexing objects' }, { status: 500 });
	}
}
