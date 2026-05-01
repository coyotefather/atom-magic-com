/**
 * fetchCharacterData.ts
 *
 * Fetches all of the reference data that the Character Manager needs to
 * populate its creation wizard — cultures, paths, patronages, disciplines,
 * scores, subscores, and additional scores — in a single cached call.
 *
 * This is called once from each of the character-related pages (character
 * creation, character generator, shared character view) and the result is
 * passed down as props to the <Sections /> component.
 *
 * Why one big fetch instead of many small ones?
 *   The Character Manager shows all of this data simultaneously in its
 *   wizard sections. Fetching them all in parallel (via Promise.all) and
 *   caching the combined result is faster and simpler than orchestrating
 *   seven separate cached calls.
 *
 * Caching:
 *   The fetch is wrapped in `unstable_cache` (Next.js server-side data cache)
 *   with a 1-hour TTL and the cache tag `'character-data'`. If any of this
 *   data changes in the CMS and you need it to update immediately, you can
 *   revalidate it via:
 *     `revalidateTag('character-data', 'default')` from a Payload afterChange hook
 *   Currently we don't have a hook wired up for this — a full redeploy or the
 *   1-hour natural expiry are the current update mechanisms.
 *
 * The `_id` convention:
 *   Payload CMS uses `id: number` for all documents. The character components
 *   were originally written for Sanity CMS which used `_id: string`. To avoid
 *   rewriting every component, the `norm()` helper adds `_id: String(id)` to
 *   every document. This means both `doc.id` (number) and `doc._id` (string)
 *   work throughout the character components.
 *
 * Relationship depth:
 *   `depth: 0` — return only the document itself (relationships stay as IDs)
 *   `depth: 1` — resolve one level of relationships (e.g., patronage effects → entry IDs → entry docs)
 *   `depth: 2` — resolve two levels (e.g., discipline → techniques → full technique docs)
 *
 * Used by:
 *   - src/app/(website)/character/page.tsx
 *   - src/app/(website)/character/generator/page.tsx
 *   - src/app/(website)/character/[id]/page.tsx (shared character view)
 */

import { unstable_cache } from 'next/cache'
import { getPayloadClient } from './payload'
import type { Score, Subscore, AdditionalScore, Discipline, Technique, Path } from '../../payload-types'

/**
 * Adds `_id: String(id)` to any Payload document for compatibility with
 * character components that were originally written for Sanity CMS.
 *
 * Sanity used `_id: string`; Payload uses `id: number`. This shim lets
 * both `doc.id` and `doc._id` work without changing every component.
 */
function norm<T extends { id: number }>(doc: T): T & { _id: string } {
  return { ...doc, _id: String(doc.id) }
}

/**
 * Fetches and normalizes all character creation reference data.
 *
 * Makes seven parallel Payload queries and post-processes each collection's
 * results into the normalized shapes the character components expect.
 *
 * The result is server-cached for 1 hour under the tag `'character-data'`.
 * Calling this function multiple times within the cache window returns the
 * same in-memory result — no additional database queries are made.
 *
 * Returns:
 *   - `cultures`       — Playable culture options (Spiranos, Boreanos, etc.)
 *   - `paths`          — Character paths (Theurgist, Iconoclast, Autodidact) with score modifiers
 *   - `patronages`     — Patron deity/entity choices with associated lore entry references
 *   - `disciplines`    — Magic school options with their available techniques and paths
 *   - `scores`         — The four core scores (Physical, Interpersonal, Intellect, Psyche)
 *                        with their subscores pre-joined (subscores live in a separate collection
 *                        and reference scores, so we join them here rather than using Payload depth)
 *   - `subscores`      — Flat list of all subscores (also embedded in scores above)
 *   - `additionalScores` — Derived stats (Physical Shield, Psychic Shield, etc.) with their
 *                        formula sources pre-flattened to `{ _id: string }` references
 */
export const fetchCharacterData = unstable_cache(
  async function fetchCharacterData() {
  const payload = await getPayloadClient()

  // Fetch all seven collections in parallel to minimize total DB round-trip time.
  // Limits are generous — none of these collections are expected to exceed these counts.
  // Subscores gets 200 because there are ~4 scores × multiple subscores each.
  const [culturesRes, pathsRes, patronagesRes, disciplinesRes, scoresRes, subscoresRes, additionalScoresRes] =
    await Promise.all([
      payload.find({ collection: 'cultures', limit: 100, depth: 0 }),
      payload.find({ collection: 'paths', limit: 100, depth: 2 }),
      payload.find({ collection: 'patronages', limit: 100, depth: 2 }),
      payload.find({ collection: 'disciplines', limit: 100, depth: 2 }),
      payload.find({ collection: 'scores', limit: 100, depth: 0 }),
      payload.find({ collection: 'subscores', limit: 200, depth: 0 }),
      payload.find({ collection: 'additional-scores', limit: 50, depth: 1 }),
    ])

  // Build the score+subscores structure manually rather than relying on Payload depth,
  // because subscores reference scores (not the other way around). Asking Payload to
  // `depth: 1` on scores would return no subscores at all — we need to invert the join
  // ourselves: iterate each score and collect the subscores that reference it by ID.
  const scores = scoresRes.docs.map(score => norm({
    ...score,
    subscores: subscoresRes.docs
      .filter(ss => {
        // ss.score can be either the raw ID (number) or a resolved Score object,
        // depending on Payload's depth setting. Handle both cases.
        const ssScoreId = typeof ss.score === 'number' ? ss.score : (ss.score as Score | null)?.id
        return ssScoreId === score.id
      })
      .map(ss => norm({ ...ss as Subscore, defaultValue: (ss as Subscore).defaultValue ?? null })),
  }))

  // Normalize disciplines: join in the related paths and techniques using norm()
  // so all referenced documents also get the _id shim.
  // If a relationship hasn't been resolved (still just a number ID), create a stub
  // so the component can at least render the ID reference without crashing.
  const disciplines = disciplinesRes.docs.map(d => norm({
    ...d as Discipline,
    paths: (d.paths ?? []).map(p =>
      typeof p === 'number' ? { _id: String(p), id: p, title: null } : norm(p as Path)
    ),
    techniques: (d.techniques ?? []).map(t =>
      typeof t === 'number' ? { _id: String(t), id: t, title: null } : norm(t as Technique)
    ),
  }))

  // Normalize paths: each path has a `modifiers` array where each modifier references
  // a specific subscore (e.g., "+2 to Agility"). The subscore in turn references its
  // parent score. We need to norm() both levels so both get their _id shims.
  const paths = (pathsRes.docs.map(p => {
    const modifiers = (p.modifiers ?? []).map(m => {
      const rawSub = m.modifierSubscore
      if (!rawSub || typeof rawSub === 'number') {
        // Not resolved — create a stub with just the ID
        const id = typeof rawSub === 'number' ? rawSub : 0
        return { ...m, modifierSubscore: { _id: String(id), id, score: null } }
      }
      // Resolved — norm() the subscore, and also norm() its parent score if it's resolved
      const sub = rawSub as Subscore
      const rawScore = sub.score
      const normedScore = !rawScore
        ? null
        : typeof rawScore === 'number'
          ? { _id: String(rawScore), id: rawScore as number, title: null }
          : norm(rawScore as Score)
      return { ...m, modifierSubscore: norm({ ...sub, score: normedScore }) }
    })
    return norm({ ...p as Path, modifiers })
  })) as import('./character-types').NormedPath[]

  // Normalize patronages: each patronage can have an `effects` array where each
  // effect may reference a Codex entry. Norm() the entry reference if it's resolved.
  const patronages = patronagesRes.docs.map(p => norm({
    ...p,
    effects: (p.effects ?? []).map(e => ({
      ...e,
      entry: e.entry && typeof e.entry !== 'number'
        ? norm(e.entry)
        : e.entry,
    })),
  }))

  // Normalize additionalScores: each additional score (like Physical Shield) has a
  // `scores` array that lists which Score or Subscore values feed into its formula.
  // These are stored as polymorphic relationships that can point to either a Score
  // or a Subscore document. Flatten them to `{ _id: string }` stubs so the
  // `setAdditionalScores` reducer in characterSlice can look them up by _id.
  const additionalScores = additionalScoresRes.docs.map(as => {
    const normalized = norm({ ...as as AdditionalScore })
    return {
      ...normalized,
      scores: (as.scores ?? []).map(s => {
        const val = s.value
        if (typeof val === 'number') return { _id: String(val) }
        return { ...(val as Score | Subscore), _id: String((val as { id: number }).id) }
      }),
    }
  })

  const cultures = culturesRes.docs.map(norm)

  return {
    cultures,
    paths,
    patronages,
    disciplines,
    scores,
    subscores: subscoresRes.docs.map(norm),
    additionalScores,
  }
},
  // Cache key: uniquely identifies this cached function call in Next.js's data cache.
  // If this key changes, all cached data for this function is invalidated.
  ['character-data'],
  // Revalidate once per hour. CMS data doesn't change frequently enough to need
  // more aggressive invalidation. A Payload afterChange hook could call
  // revalidateTag('character-data') to force immediate updates when needed.
  { revalidate: 3600 },
)
