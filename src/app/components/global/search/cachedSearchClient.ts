'use client';

import { liteClient as algoliasearch } from 'algoliasearch/lite';

type SearchClient = ReturnType<typeof algoliasearch>;
type SearchResponse = Awaited<ReturnType<SearchClient['search']>>;

interface CacheEntry {
	response: SearchResponse;
	timestamp: number;
}

const CACHE_SIZE = 50;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Creates a cached Algolia search client with request deduplication.
 * - Caches recent search results to reduce API calls
 * - Deduplicates concurrent requests for the same query
 * - Automatically expires stale cache entries
 */
export function createCachedSearchClient(
	appId: string,
	apiKey: string
): SearchClient {
	const client = algoliasearch(appId, apiKey);
	const cache = new Map<string, CacheEntry>();
	const pendingRequests = new Map<string, Promise<SearchResponse>>();

	// Capture the original search method bound to the client
	const originalSearch = client.search.bind(client);

	// Generate a cache key from search parameters
	function getCacheKey(requests: Parameters<SearchClient['search']>[0]): string {
		return JSON.stringify(requests);
	}

	// Clean expired entries and enforce size limit
	function cleanCache(): void {
		const now = Date.now();

		// Remove expired entries
		for (const [key, entry] of cache) {
			if (now - entry.timestamp > CACHE_TTL) {
				cache.delete(key);
			}
		}

		// Enforce size limit (remove oldest entries)
		if (cache.size > CACHE_SIZE) {
			const entries = Array.from(cache.entries());
			entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

			const toRemove = entries.slice(0, cache.size - CACHE_SIZE);
			for (const [key] of toRemove) {
				cache.delete(key);
			}
		}
	}

	// Create a cached search function
	const cachedSearch = async (
		...args: Parameters<SearchClient['search']>
	): Promise<SearchResponse> => {
		const cacheKey = getCacheKey(args[0]);

		// Check cache first
		const cached = cache.get(cacheKey);
		if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
			return cached.response;
		}

		// Check for pending request (deduplication)
		const pending = pendingRequests.get(cacheKey);
		if (pending) {
			return pending;
		}

		// Make the actual request using the captured original method
		const request = originalSearch(...args).then((response) => {
			// Cache the response
			cache.set(cacheKey, {
				response,
				timestamp: Date.now(),
			});

			// Clean up
			pendingRequests.delete(cacheKey);
			cleanCache();

			return response;
		}).catch((error) => {
			pendingRequests.delete(cacheKey);
			throw error;
		});

		// Store pending request for deduplication
		pendingRequests.set(cacheKey, request);

		return request;
	};

	// Create a proxy that intercepts the search method
	return new Proxy(client, {
		get(target, prop) {
			if (prop === 'search') {
				return cachedSearch;
			}

			// Pass through all other properties/methods
			const value = Reflect.get(target, prop, target);
			if (typeof value === 'function') {
				return value.bind(target);
			}
			return value;
		},
	});
}
