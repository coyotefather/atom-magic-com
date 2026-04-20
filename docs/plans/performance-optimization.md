# Performance Optimization Plan

RES dropped from high to 28 after Payload CMS migration. Root cause: pages that were
CDN-cached HTTP calls to Sanity now run live Payload + Neon DB queries on every request.

Work in order — top items have the highest RES impact per effort.

---

## 🔴 Immediate (config changes, very low risk)

### 1. Add Vercel Blob to `next/image` remotePatterns
**File:** `next.config.mjs`

Vercel Blob URLs (`*.public.blob.vercel-storage.com`) are not in `remotePatterns`. Any `<Image>` rendering a Blob URL falls back to unoptimized serving — no WebP/AVIF, no responsive sizing. A 2MB PNG is delivered as-is. Affects all CMS media: creature cards, codex entry images, etc.

```js
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.public.blob.vercel-storage.com',
    },
    {
      protocol: 'https',
      hostname: 'cdn.sanity.io', // keep until all old content is gone
    },
  ],
},
```

- [x] Update `next.config.mjs`

---

### 2. Remove `force-dynamic` from Codex index page
**File:** `src/app/(website)/codex/page.tsx:6`

`export const dynamic = 'force-dynamic'` is set but the page has zero server-side data fetching — only a client-side Algolia `<Search />` component. Every `/codex` visit triggers a serverless cold start instead of being served from Vercel CDN edge.

- [x] Remove `export const dynamic = 'force-dynamic'` from `codex/page.tsx`

---

### 3. Add ISR revalidation to data-heavy pages
Pages that fetch near-static CMS data on every request. Data changes only when an admin edits content — it does not need to be live on every user request.

**Files and fixes:**

```ts
// src/app/(website)/page.tsx — homepage random entry changes once/day
export const revalidate = 86400

// src/app/(website)/codex/timeline/page.tsx
export const revalidate = 3600

// src/app/(website)/character/page.tsx
export const revalidate = 3600

// src/app/(website)/generator/page.tsx
export const revalidate = 3600
```

- [x] `src/app/(website)/page.tsx` — `revalidate = 86400`
- [x] `src/app/(website)/codex/timeline/page.tsx` — `revalidate = 3600`
- [x] `src/app/(website)/character/page.tsx` — `revalidate = 3600`
- [x] `src/app/(website)/generator/page.tsx` — `revalidate = 3600`

---

### 4. Cache `fetchCharacterData` result
**File:** `src/lib/fetchCharacterData.ts`

`character/page.tsx` and `generator/page.tsx` both call `fetchCharacterData()` which fires 7 parallel DB queries. The result is identical for both pages and changes only when an admin edits game data. Adding `'use cache'` shares one cached result across all callers.

```ts
export async function fetchCharacterData() {
  'use cache'
  // ... existing implementation unchanged
}
```

Alternatively use `unstable_cache` from `next/cache` if `'use cache'` is not yet stable in this Next.js version.

- [x] Add caching to `fetchCharacterData`

---

## 🟠 Important (structural fixes)

### 5. Parallelize the entry slug lookup
**File:** `src/app/(website)/codex/entries/[slug]/page.tsx` — `findEntryBySlug()`

Currently iterates 5 collections in a `for` loop, firing sequential DB queries until a match is found. Worst case: 4 failed round-trips before finding the slug. Same pattern in `codex/categories/[slug]/page.tsx`.

**Fix:**
```ts
async function findEntryBySlug(slug: string) {
  const payload = await getPayloadClient()
  const results = await Promise.all(
    SEARCHABLE_COLLECTIONS.map(collection =>
      payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 2 })
        .then(r => r.docs.length > 0 ? { doc: r.docs[0], type: collection } : null)
    )
  )
  return results.find(Boolean) ?? null
}
```

Also add `export const revalidate = 3600` to these pages so ISR handles cache misses rather than live DB queries.

- [x] Parallelize `findEntryBySlug` in `codex/entries/[slug]/page.tsx`
- [x] Parallelize the lookup in `codex/categories/[slug]/page.tsx`
- [x] Add `revalidate = 3600` to both pages

---

### 6. Cache the creature tools layout query
**File:** `src/app/(website)/(creature-tools)/layout.tsx`

Every request to `/creatures`, `/encounters`, or `/creatures/manager` runs `payload.find({ collection: 'creatures', limit: 500, depth: 1 })`. No caching. 500 documents with relationships resolved = large, slow query.

**Fix:** Wrap in `unstable_cache` with a `creatures` tag; call `revalidateTag('creatures')` in the Payload `afterChange` hook:

```ts
// layout.tsx
import { unstable_cache } from 'next/cache'

const getCreatures = unstable_cache(
  async () => {
    const payload = await getPayloadClient()
    const result = await payload.find({ collection: 'creatures', limit: 500, depth: 1 })
    return result.docs
  },
  ['creatures-all'],
  { revalidate: 3600, tags: ['creatures'] }
)
```

```ts
// src/payload/hooks/algoliaSync.ts (or a new creatureHooks.ts)
import { revalidateTag } from 'next/cache'

export const invalidateCreatureCache: CollectionAfterChangeHook = async () => {
  revalidateTag('creatures')
}
```

- [x] Add `unstable_cache` to creature tools layout
- [ ] Add `revalidateTag('creatures')` afterChange hook to Creatures collection

---

### 7. Constrain Neon connection pool for serverless
**File:** `payload.config.ts`

Default `pg` pool is tuned for long-lived servers. On Vercel, each function invocation may open a new TCP connection. Under load, connections accumulate and hit Neon's connection limits, causing random 5–30s TTFB spikes.

```ts
db: postgresAdapter({
  pool: {
    connectionString: process.env.DATABASE_URL || '',
    max: 1, // one connection per serverless function instance
  },
}),
```

Longer term: consider migrating to `@neondatabase/serverless` with the HTTP transport (no TCP cold-start).

- [x] Add `max: 1` to pool config
- [ ] Evaluate Neon HTTP driver migration

---

## 🟡 Lower priority (client bundle / hydration)

### 8. Remove `'use client'` from Entry and UnifiedEntry components
**Files:** `src/app/components/codex/Entry.tsx:1`, `src/app/components/codex/UnifiedEntry.tsx:1`

Both are pure render components with no hooks or event handlers. `'use client'` forces their entire tree (including Lexical `RichText`) to ship as JS, delays LCP, and prevents streaming.

- [x] Audit `Entry.tsx` — remove `'use client'` if no hooks/browser APIs
- [x] Audit `UnifiedEntry.tsx` — same
- [x] If any child needs interactivity, split it into its own client component

---

### 9. Audit `PageHero` for unnecessary `'use client'`
**File:** `src/app/components/common/PageHero.tsx:1`

Used on nearly every public page. If it has no hooks or browser APIs, removing `'use client'` eliminates a client boundary at the top of `<main>` on every page and reduces the MDI icon bundle shipped to the client.

- [x] Audit `PageHero.tsx` — remove `'use client'` if no hooks needed

---

### 10. Lazy-load `styled-components` consumer (likely `easymde`)
**File:** `package.json`

`styled-components` is a runtime CSS-in-JS lib that injects styles during hydration, causing CLS. Identify which component pulls it in (likely `easymde` rich text editor or similar) and wrap with `dynamic(() => import(...), { ssr: false })`.

- [ ] Find which component imports `styled-components`
- [ ] Lazy-load with `ssr: false`
