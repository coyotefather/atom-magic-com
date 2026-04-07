import { algoliasearch } from 'algoliasearch'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

const algoliaClient = algoliasearch(
	process.env.ALGOLIA_APP_ID!,
	process.env.ALGOLIA_API_KEY!,
)
const indexName = process.env.ALGOLIA_INDEX_NAME!

export const algoliaAfterChange: CollectionAfterChangeHook = async ({ doc, collection }) => {
	try {
		await algoliaClient.saveObject({
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

export const algoliaAfterDelete: CollectionAfterDeleteHook = async ({ id }) => {
	try {
		await algoliaClient.deleteObject({ indexName, objectID: String(id) })
	} catch (err) {
		console.error('Algolia afterDelete sync error:', err instanceof Error ? err.message : err)
	}
}
