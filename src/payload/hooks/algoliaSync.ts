/**
 * algoliaSync.ts
 *
 * Payload CMS hooks that keep the Algolia search index in sync with CMS content.
 *
 * How Algolia search works in this app:
 *   - Algolia is an external search service that stores a copy of key fields
 *     from each CMS document in its own index (a fast, searchable database).
 *   - The Codex search UI uses Algolia's react-instantsearch library to query
 *     this index on the client side, without hitting the main database.
 *   - This means every time a CMS document is saved or deleted, we need to
 *     push the change to Algolia so the search results stay accurate.
 *
 * How these hooks work:
 *   - `algoliaAfterChange` runs after ANY save (create or update) on any
 *     collection that includes it in its `afterChange` hooks array.
 *   - `algoliaAfterDelete` runs after a document is deleted from any
 *     collection that includes it in its `afterDelete` hooks array.
 *   - These hooks are added to collections in their individual config files
 *     (e.g., Entries.ts, Creatures.ts, Disciplines.ts, etc.).
 *
 * What gets indexed:
 *   Each Algolia object stores a small subset of the document's fields:
 *     - `objectID` — Payload's numeric document ID (as string) — Algolia's unique key
 *     - `title`    — The document's title or name (used for display in search results)
 *     - `path`     — The slug, used to build the URL to the full document
 *     - `description` — A short plain-text description (shown in search result previews)
 *     - `documentType` — The collection slug (e.g., 'entries', 'creatures') — used to
 *       filter results by content type in the search UI
 *
 *   Rich text fields (toc, entryBody) are NOT indexed — only the plain `description`
 *   textarea is included. The full content can be found via the document URL.
 *
 * Environment variables required:
 *   - `ALGOLIA_APP_ID`    — The Algolia application ID (from the Algolia dashboard)
 *   - `ALGOLIA_API_KEY`   — An API key with write access to the index
 *   - `ALGOLIA_INDEX_NAME` — The name of the index to write to (e.g., 'atom-magic')
 *
 *   If any of these are missing, the hooks silently no-op — safe for local dev
 *   without Algolia configured.
 *
 * Bulk reindex:
 *   These hooks handle incremental updates (one document at a time). To rebuild
 *   the entire index from scratch (e.g., after a data migration), POST to:
 *   `/api/algolia?reindex=true&secret=<ALGOLIA_ADMIN_SECRET>`
 *   That route is defined in `src/app/api/algolia/route.ts`.
 *
 * Collections that use these hooks:
 *   - Entries (Codex articles)
 *   - Creatures
 *   - Disciplines
 *   - Techniques
 *   - Paths
 */

import { algoliasearch } from 'algoliasearch'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

/**
 * Creates and returns an Algolia client using credentials from environment variables.
 * Returns null if either credential is missing — hooks that receive null will skip
 * their operation rather than throwing.
 */
function getAlgoliaClient() {
	const appId = process.env.ALGOLIA_APP_ID
	const apiKey = process.env.ALGOLIA_API_KEY
	if (!appId || !apiKey) return null
	return algoliasearch(appId, apiKey)
}

/** The Algolia index name to write to. Falls back to empty string if unset (effectively a no-op). */
const indexName = process.env.ALGOLIA_INDEX_NAME ?? ''

/**
 * Payload `afterChange` hook that upserts the document's search record in Algolia.
 *
 * Called after every successful create or update operation on any collection
 * that includes this hook. Extracts the minimal set of fields needed for search
 * and saves them as an Algolia object, keyed by the document's Payload ID.
 *
 * If Algolia credentials are missing or the Algolia API call fails, the error
 * is logged but does NOT cause the Payload save to fail — Algolia sync is
 * best-effort and should never block a content editor from saving their work.
 */
export const algoliaAfterChange: CollectionAfterChangeHook = async ({ doc, collection }) => {
	const client = getAlgoliaClient()
	if (!client) return
	try {
		await client.saveObject({
			indexName,
			body: {
				objectID: String(doc.id),
				title: doc.title ?? doc.name ?? '',
				path: doc.slug ?? '',
				description: doc.description ?? '',
				documentType: collection.slug,
			},
		})
	} catch (err) {
		console.error('Algolia afterChange sync error:', err instanceof Error ? err.message : err)
	}
}

/**
 * Payload `afterDelete` hook that removes the document's search record from Algolia.
 *
 * Called after a document is deleted from any collection that includes this hook.
 * Uses the document's Payload ID to locate and delete the corresponding Algolia object.
 *
 * Like `algoliaAfterChange`, errors are logged but do not cause the delete to fail.
 */
export const algoliaAfterDelete: CollectionAfterDeleteHook = async ({ id }) => {
	const client = getAlgoliaClient()
	if (!client) return
	try {
		await client.deleteObject({ indexName, objectID: String(id) })
	} catch (err) {
		console.error('Algolia afterDelete sync error:', err instanceof Error ? err.message : err)
	}
}
