import { algoliasearch } from 'algoliasearch'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

function getAlgoliaClient() {
	const appId = process.env.ALGOLIA_APP_ID
	const apiKey = process.env.ALGOLIA_API_KEY
	if (!appId || !apiKey) return null
	return algoliasearch(appId, apiKey)
}

const indexName = process.env.ALGOLIA_INDEX_NAME ?? ''

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

export const algoliaAfterDelete: CollectionAfterDeleteHook = async ({ id }) => {
	const client = getAlgoliaClient()
	if (!client) return
	try {
		await client.deleteObject({ indexName, objectID: String(id) })
	} catch (err) {
		console.error('Algolia afterDelete sync error:', err instanceof Error ? err.message : err)
	}
}
