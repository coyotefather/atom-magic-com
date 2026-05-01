/**
 * payload.ts
 *
 * Singleton accessor for the Payload CMS Local API.
 *
 * "Payload Local API" means we call Payload's JavaScript functions directly
 * in the same Node.js process — there is NO HTTP request involved. Payload
 * talks to the database directly. This is faster and simpler than making
 * HTTP requests to `/api/*` routes.
 *
 * Why a singleton / global cache?
 *   Initializing Payload is expensive — it connects to the database, loads
 *   all collection configs, and sets up plugins. In a Next.js app with many
 *   server components and server actions, `getPayloadClient()` can be called
 *   hundreds of times per build or per request cycle.
 *
 *   Storing the instance on `global` (Node.js's true global object) means:
 *     - The first call initializes Payload and caches the Promise on `global`
 *     - Every subsequent call returns the same cached Promise (and thus the
 *       same Payload instance once resolved)
 *     - Even if two calls happen simultaneously before the first one resolves,
 *       they both await the SAME Promise (not two competing initializations)
 *
 *   In development with Next.js hot reload, the module cache is cleared on
 *   each reload but `global` survives — this prevents a new Payload connection
 *   on every file save.
 *
 * How to use this:
 *   ```typescript
 *   import { getPayloadClient } from '@/lib/payload';
 *
 *   const payload = await getPayloadClient();
 *
 *   const result = await payload.find({
 *     collection: 'entries',
 *     limit: 100,
 *     depth: 2,  // How many levels of relationships to resolve automatically
 *   });
 *   ```
 *
 * Available operations (all typed against this app's collection configs):
 *   - `payload.find({ collection, where, limit, depth })`     — Query a collection
 *   - `payload.findByID({ collection, id })`                  — Fetch one document
 *   - `payload.create({ collection, data })`                  — Create a document
 *   - `payload.update({ collection, id, data })`              — Update a document
 *   - `payload.delete({ collection, id })`                    — Delete a document
 *
 * Used by:
 *   - src/lib/fetchCharacterData.ts (loads all character creation data)
 *   - src/app/(website)/codex/* (loads codex entries)
 *   - src/app/(website)/(creature-tools)/* (loads creatures)
 *   - src/app/api/algolia/route.ts (bulk reindex)
 *   - Various page.tsx files throughout the site
 */

import { getPayload } from 'payload'
import config from '@payload-config'

declare global {
  // eslint-disable-next-line no-var
  var _payloadInstance: ReturnType<typeof getPayload> | undefined
}

/**
 * Returns the shared Payload CMS client instance.
 *
 * The instance is initialized once and cached on `global` so that repeated
 * calls (across many server components in a single build or request cycle)
 * reuse the same database connection pool rather than opening new ones.
 *
 * Always `await` the return value — it returns a Promise that resolves to
 * the initialized Payload instance.
 */
export async function getPayloadClient() {
  if (!global._payloadInstance) {
    // Assign the Promise immediately so concurrent callers share one in-flight init
    global._payloadInstance = getPayload({ config })
  }
  return global._payloadInstance
}
