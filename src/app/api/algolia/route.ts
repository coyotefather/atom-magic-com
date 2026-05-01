/**
 * algolia/route.ts
 *
 * API route for rebuilding the Algolia search index from scratch.
 *
 * There are two ways the Algolia index stays in sync:
 *
 *   1. Incremental sync (automatic): Payload's `afterChange` / `afterDelete` hooks
 *      in `src/payload/hooks/algoliaSync.ts` fire every time a document is saved
 *      or deleted, updating Algolia one document at a time.
 *
 *   2. Bulk reindex (this endpoint): Rebuilds the ENTIRE index by querying all
 *      searchable collections and pushing all documents to Algolia at once.
 *      Use this when the incremental sync has gotten out of date — for example,
 *      after a data migration, after a major content import, or if Algolia's
 *      index was accidentally cleared.
 *
 * Usage:
 *   POST /api/algolia?reindex=true&secret=<ALGOLIA_ADMIN_SECRET>
 *
 * Authentication:
 *   The `secret` query parameter must match the `ALGOLIA_ADMIN_SECRET` environment
 *   variable. This prevents unauthorized parties from triggering expensive reindex
 *   operations. Only admins who know the secret can trigger this.
 *
 * What gets indexed:
 *   All documents from these five collections:
 *     - entries (Codex articles)
 *     - creatures
 *     - disciplines
 *     - techniques
 *     - paths
 *
 *   Each document is indexed with: objectID, title, path (slug), description,
 *   and documentType. Rich text fields are NOT indexed — only the plain-text
 *   `description` field.
 *
 * Performance note:
 *   This endpoint fetches up to 500 documents per collection (2,500 total) in
 *   a single request. On large datasets this could be slow or hit Algolia's
 *   batch size limits. For now the limits are generous enough for this project's
 *   data volume.
 *
 * Environment variables required:
 *   - `ALGOLIA_APP_ID`       — Algolia application ID
 *   - `ALGOLIA_API_KEY`      — Algolia API key with write/index permissions
 *   - `ALGOLIA_INDEX_NAME`   — The index to write to
 *   - `ALGOLIA_ADMIN_SECRET` — The shared secret for authorizing reindex requests
 *
 * Returns:
 *   - 200 `{ message: "Bulk reindex complete. Indexed N documents." }` on success
 *   - 400 `{ error: "Unknown action" }` if `reindex=true` is not in the query params
 *   - 401 `{ error: "Unauthorized" }` if the secret is missing or wrong
 *   - 500 `{ error: "Error indexing objects" }` on Algolia API or Payload error
 */

import { algoliasearch } from 'algoliasearch';
import { getPayloadClient } from '@/lib/payload';

/**
 * Creates and returns an Algolia client using credentials from environment variables.
 * Returns null if credentials are missing.
 */
function getAlgoliaClient() {
	const appId = process.env.ALGOLIA_APP_ID
	const apiKey = process.env.ALGOLIA_API_KEY
	if (!appId || !apiKey) return null
	return algoliasearch(appId, apiKey)
}

/**
 * The collections included in the Algolia search index.
 * If a new collection should be searchable via the Codex search UI, add its slug here.
 */
const SEARCHABLE_COLLECTIONS = ['entries', 'creatures', 'disciplines', 'techniques', 'paths'] as const;

/**
 * Queries all searchable collections from Payload and pushes the full dataset
 * to Algolia's `saveObjects` API (which upserts — creates or replaces each object).
 *
 * Uses `depth: 0` because we only need the flat document fields (title, slug,
 * description) — no relationship resolution needed for search indexing.
 */
async function performBulkReindex() {
	const client = getAlgoliaClient()
	if (!client) throw new Error('Algolia is not configured')
	const indexName = process.env.ALGOLIA_INDEX_NAME ?? ''
	const payload = await getPayloadClient();
	const records: Record<string, unknown>[] = [];

	for (const collection of SEARCHABLE_COLLECTIONS) {
		const result = await payload.find({ collection, limit: 500, depth: 0 });
		for (const doc of result.docs) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const d = doc as any;
			records.push({
				objectID: String(doc.id),
				// Creatures use `name`; all other collections use `title`
				title: d.title ?? d.name ?? '',
				path: d.slug ?? '',
				description: d.description ?? '',
				documentType: collection,
			});
		}
	}

	// saveObjects is an upsert operation — existing objects are replaced,
	// new objects are created. Objects not in the current dataset are NOT deleted.
	// If you need to remove deleted documents from the index, call deleteObject
	// separately or clear the index before re-indexing.
	await client.saveObjects({ indexName, objects: records });

	return { message: `Bulk reindex complete. Indexed ${records.length} documents.` };
}

export async function POST(request: Request) {
	try {
		const { searchParams } = new URL(request.url);

		if (searchParams.get('reindex') === 'true') {
			// Require the admin secret to prevent unauthorized bulk reindex
			const adminSecret = searchParams.get('secret');
			if (!adminSecret || adminSecret !== process.env.ALGOLIA_ADMIN_SECRET) {
				return Response.json({ error: 'Unauthorized' }, { status: 401 });
			}
			const response = await performBulkReindex();
			return Response.json(response);
		}

		// No recognized action in the query params
		return Response.json({ error: 'Unknown action' }, { status: 400 });
	} catch (error) {
		console.error('Algolia reindex error:', error instanceof Error ? error.message : 'Unknown error');
		return Response.json({ error: 'Error indexing objects' }, { status: 500 });
	}
}
