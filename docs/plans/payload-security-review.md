# Payload CMS — Security & Code Quality Plan

Findings from post-migration code review. Work in priority order.

---

## 🔴 Critical

### 1. Add access control to all collections
**Files:** `src/payload/collections/*.ts` (all non-Users collections)

All collections currently have no `access` key, meaning the REST API (`/api/entries`, `/api/creatures`, etc.) is fully open — anyone can create, update, or delete documents without authentication.

**Fix:** Add `access` to every collection. Public collections (codex content) allow open reads; writes require `req.user`.

```ts
// All content collections (Entries, Creatures, Disciplines, etc.)
access: {
  read: () => true,
  create: ({ req }) => Boolean(req.user),
  update: ({ req }) => Boolean(req.user),
  delete: ({ req }) => Boolean(req.user),
},

// Users collection — stricter
access: {
  read:   ({ req }) => Boolean(req.user),
  create: () => false,        // admin creates users only
  update: ({ req, id }) => req.user?.id === id,
  delete: ({ req }) => Boolean(req.user),
},
```

- [x] Entries
- [x] Creatures
- [x] Disciplines
- [x] Techniques
- [x] Paths
- [x] Cultures
- [x] Patronages
- [x] Scores
- [x] Subscores
- [x] AdditionalScores
- [x] Enhancements
- [x] Categories
- [x] Timeline
- [x] Media
- [x] Users (stricter rules above)

---

### 2. Fix Payload singleton race condition
**File:** `src/lib/payload.ts`

The check-then-assign has a race window: two concurrent cold-start requests both see `null` and both call `getPayload()`, creating two instances sharing the same DB pool. On Next.js dev, the old instance is abandoned and its pool connections leak.

**Fix:** Assign the Promise (not the resolved value) to the global so concurrent callers share the same in-flight init:

```ts
import { getPayload } from 'payload'
import config from '@payload-config'

declare global {
  // eslint-disable-next-line no-var
  var _payloadInstance: ReturnType<typeof getPayload> | undefined
}

export async function getPayloadClient() {
  if (!global._payloadInstance) {
    global._payloadInstance = getPayload({ config })
  }
  return global._payloadInstance
}
```

- [x] Update `src/lib/payload.ts`

---

### 3. Restrict MCP plugin collection access
**File:** `payload.config.ts`

The MCP plugin exposes create/update/delete for all 14 collections including `users` and `media`. Until access control (#1) is in place, any MCP client can mutate anything. Even after #1, `users` should not be exposed via MCP.

**Fix:** Remove `users` from the plugin config; consider removing `media` unless there's a use case:

```ts
mcpPlugin({
  collections: {
    // ... other collections ...
    // media: { enabled: true },   // re-enable only if needed
    // users not listed — never expose via MCP
  },
})
```

- [x] Remove `users` from mcpPlugin config
- [x] Decide on `media` (removed from MCP — no current use case)
- [x] Verify plugin requires Bearer token auth (it does — API keys in admin)

---

## 🟠 Important

### 4. Add `unique: true` and `index: true` to all slug fields
**Files:** `Entries.ts:22`, `Creatures.ts:16`, `Disciplines.ts:23`, `Techniques.ts:27`, `Paths.ts:27`, `Categories.ts:15`

Slug fields are the primary lookup key but have no DB unique constraint or index. Duplicates silently break routing; missing index means full table scan on every page load.

```ts
{
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
},
```

- [x] Entries
- [x] Creatures
- [x] Disciplines
- [x] Techniques
- [x] Paths
- [x] Categories
- [ ] Run `payload migrate` after to apply schema changes

---

### 5. Remove redundant `subscores` relationship from `Scores` collection
**File:** `src/payload/collections/Scores.ts:27`

`Scores.subscores` is a redundant `hasMany` relationship. The data layer (`fetchCharacterData.ts`) correctly uses the FK on `Subscores.score` and ignores this field. An editor could populate `Scores.subscores` with values that contradict the real FK data.

**Fix:** Remove the `subscores` field from `Scores.ts`. No data migration needed — the field is never queried.

- [x] Remove `subscores` from `Scores.ts`

---

### 6. Guard Algolia env vars against missing values
**Files:** `src/payload/hooks/algoliaSync.ts:4–8`, `src/app/api/algolia/route.ts:4–8`

`process.env.ALGOLIA_APP_ID!` etc. are non-null asserted at module load. In preview deploys without Algolia configured, the client initialises with `undefined` and throws an obscure error when a document is saved.

**Fix:** Lazy-init the client with a guard:

```ts
function getAlgoliaClient() {
  const appId = process.env.ALGOLIA_APP_ID
  const apiKey = process.env.ALGOLIA_API_KEY
  if (!appId || !apiKey) return null
  return algoliasearch(appId, apiKey)
}

// In hook:
const client = getAlgoliaClient()
if (!client) return  // silently skip in envs without Algolia
```

- [x] Update `src/payload/hooks/algoliaSync.ts`
- [x] Update `src/app/api/algolia/route.ts`
