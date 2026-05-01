/**
 * creatureCache.ts
 *
 * Payload CMS hook that invalidates the Next.js server-side creature cache
 * whenever a creature is saved or deleted in the admin panel.
 *
 * Background:
 *   The creature list (used by the creature roller, encounter builder, and
 *   creature manager) is fetched server-side and cached with Next.js's
 *   `unstable_cache` under the tag `'creatures'`. Caching is critical for
 *   performance — without it, every page load would query the database.
 *
 *   The problem is that `unstable_cache` doesn't automatically invalidate
 *   when the underlying data changes. Without this hook, a creature saved in
 *   the Payload admin panel would not appear on the site until the cache
 *   naturally expires (or until the next deployment).
 *
 * How this hook fixes that:
 *   Payload calls this hook immediately after any creature is saved (`afterChange`)
 *   or deleted (`afterDelete`). The hook calls Next.js's `revalidateTag('creatures')`
 *   which tells Next.js to discard all cached data tagged `'creatures'` on the next
 *   request — so the very next page load will fetch fresh data from the database.
 *
 * The `'default'` second argument:
 *   Next.js 16 changed `revalidateTag` to require a second `profile` argument
 *   (a cache profile name or config). Passing `'default'` uses the default cache
 *   profile, which is what we want in all normal cases.
 *
 * This hook is registered in src/payload/collections/Creatures.ts:
 *   ```typescript
 *   hooks: {
 *     afterChange: [algoliaAfterChange, invalidateCreatureCache],
 *     afterDelete: [algoliaAfterDelete, invalidateCreatureCache],
 *   }
 *   ```
 *
 * Related: The creature data is fetched and cached in the creature page layout.
 * The cache tag `'creatures'` is set there via `{ tags: ['creatures'] }` in
 * the `unstable_cache` call.
 */

import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

/**
 * Invalidates the `'creatures'` Next.js cache tag after any creature save or delete.
 *
 * The same function satisfies both hook types because it doesn't need any
 * arguments — it always invalidates the same cache tag regardless of which
 * creature changed or how.
 */
export const invalidateCreatureCache: CollectionAfterChangeHook & CollectionAfterDeleteHook = async () => {
  revalidateTag('creatures', 'default')
}
