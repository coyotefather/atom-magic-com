# Payload CMS App Code Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all Sanity `sanityFetch`/GROQ calls in the Next.js app with Payload Local API queries, update the Algolia webhook to work with Payload hooks instead of Sanity webhooks, replace Sanity image URL builder with direct Payload media URLs, and remove all Sanity packages.

**Architecture:** Payload's Local API (`getPayload({ config })`) runs server-side with zero network overhead — no HTTP round-trip. All current `sanityFetch` calls in Server Components become `payload.find()`/`payload.findByID()` calls. Sanity's generated `sanity.types` file is replaced by `payload-types.ts`. The Algolia route is updated to use Payload's collection hooks instead of Sanity webhooks.

**Prerequisite:** Sub-plans 1 and 2 must be complete. Payload is running with data seeded.

**Tech Stack:** Payload Local API, `payload-types.ts` (auto-generated), `@payloadcms/richtext-lexical` JSX serializer for rendering rich text, Algolia for search.

---

## Affected Files

**Modify:**
- `src/lib/payload.ts` — NEW: shared Payload instance getter (replaces `src/sanity/lib/client.ts`)
- `src/app/(website)/page.tsx` — replace Sanity daily discovery fetch
- `src/app/(website)/character/page.tsx` — replace `CHARACTER_MANAGER_QUERY`
- `src/app/(website)/generator/page.tsx` — replace `CHARACTER_MANAGER_QUERY`
- `src/app/(website)/character/shared/page.tsx` — replace 4 separate fetches
- `src/app/(website)/codex/entries/[slug]/page.tsx` — replace `UNIFIED_ENTRY_QUERY`
- `src/app/(website)/codex/categories/[slug]/page.tsx` — replace `CATEGORY_QUERY`
- `src/app/(website)/codex/timeline/page.tsx` — replace `TIMELINE_QUERY`
- `src/app/api/algolia/route.ts` — replace Sanity webhook with Payload hook trigger
- `src/app/components/codex/UnifiedEntry.tsx` — replace Sanity image builder with Payload media URL
- `src/app/components/codex/Entry.tsx` — same image URL replacement
- All components rendering `entryBody`/`toc`/`description` markdown → Lexical JSX serializer

**Delete:**
- `src/sanity/` — entire directory
- `sanity.types.ts` — root-level Sanity generated types
- `sanity.config.ts` — if exists
- `src/app/(studio)/` — Sanity Studio routes

**Keep (no change):**
- `src/app/(payload)/` — Payload admin routes (from sub-plan 1)
- All Redux slices, local gear data, creature manager, Vorago game

---

### Task 1: Create shared Payload instance getter

**Files:**
- Create: `src/lib/payload.ts`

Payload's `getPayload` is called once and cached. This module provides a single import point for all Server Components.

- [ ] **Step 1: Create the file**

```typescript
// src/lib/payload.ts
import { getPayload } from 'payload'
import config from '../../payload.config'

// Cached payload instance (Next.js module cache handles this across requests)
let payloadInstance: Awaited<ReturnType<typeof getPayload>> | null = null

export async function getPayloadClient() {
  if (!payloadInstance) {
    payloadInstance = await getPayload({ config })
  }
  return payloadInstance
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/payload.ts
git commit -m "feat: add shared Payload client getter"
```

---

### Task 2: Create Lexical rich text renderer component

**Files:**
- Create: `src/app/components/common/RichText.tsx`

All pages/components currently render markdown with `react-markdown` or similar. After migration, `entryBody`, `toc`, and `description` fields are Lexical JSON. This component uses Payload's JSX serializer — no `dangerouslySetInnerHTML`, no sanitization needed.

- [ ] **Step 1: Install the Lexical React serializer**

`@payloadcms/richtext-lexical` was installed in sub-plan 1. Verify it is present:

```bash
npm list @payloadcms/richtext-lexical
```

- [ ] **Step 2: Create the RichText component**

```tsx
// src/app/components/common/RichText.tsx
import { RichText as PayloadRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

interface RichTextProps {
  content: SerializedEditorState | null | undefined
  className?: string
}

export function RichText({ content, className }: RichTextProps) {
  if (!content) return null
  return (
    <div className={className}>
      <PayloadRichText data={content} />
    </div>
  )
}
```

The `PayloadRichText` component from `@payloadcms/richtext-lexical/react` renders Lexical JSON to JSX directly — no HTML string generation, no XSS risk.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/common/RichText.tsx
git commit -m "feat: add RichText component for Lexical JSON rendering"
```

---

### Task 3: Replace Timeline page fetch

**Files:**
- Modify: `src/app/(website)/codex/timeline/page.tsx`

This is the simplest page — no relationships, no rich text rendering.

- [ ] **Step 1: Read the current file**

Read `src/app/(website)/codex/timeline/page.tsx` to confirm current content before editing.

- [ ] **Step 2: Replace Sanity fetch with Payload**

```tsx
// src/app/(website)/codex/timeline/page.tsx
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import Timeline from '@/app/components/codex/Timeline'
import PageHero from '@/app/components/common/PageHero'
import { mdiCalendarClock } from '@mdi/js'
import Link from 'next/link'
import Icon from '@mdi/react'
import { mdiArrowLeft } from '@mdi/js'

export default async function Page() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'timeline',
    sort: '-year',
    limit: 500,
  })

  if (!result.docs.length) return notFound()

  return (
    <main className="notoserif bg-white">
      <PageHero
        title="Timeline of Solum"
        description="A chronological journey through the ages, from the dawn of the Autogena to the present day. Dates are measured in years before (A.R.) or after (P.R.) the Rubicon Event."
        icon={mdiCalendarClock}
        accentColor="laurel"
        theme="light"
      />
      <Timeline timeline={result.docs} />

      <section className="bg-parchment border-t-2 border-stone">
        <div className="container px-6 md:px-8 py-6">
          <Link
            href="/codex"
            className="inline-flex items-center gap-2 text-stone hover:text-gold transition-colors no-underline"
          >
            <Icon path={mdiArrowLeft} size={0.875} />
            <span className="marcellus uppercase tracking-wider text-sm">
              Return to Codex
            </span>
          </Link>
        </div>
      </section>
    </main>
  )
}
```

- [ ] **Step 3: Update `Timeline` component prop types**

Read `src/app/components/codex/Timeline.tsx`. Update its `timeline` prop type from `TIMELINE_QUERY_RESULT` to `Timeline[]` from `payload-types`:

```typescript
import type { Timeline } from '../../../payload-types'

interface TimelineProps {
  timeline: Timeline[]
}
```

- [ ] **Step 4: Verify dev server — no TypeScript errors**

```bash
npm run dev
```

Open `http://localhost:3000/codex/timeline` and confirm events render correctly.

- [ ] **Step 5: Commit**

```bash
git add src/app/(website)/codex/timeline/page.tsx src/app/components/codex/Timeline.tsx
git commit -m "feat: migrate timeline page to Payload Local API"
```

---

### Task 4: Replace Character Manager and Generator page fetches

**Files:**
- Modify: `src/app/(website)/character/page.tsx`
- Modify: `src/app/(website)/generator/page.tsx`
- Modify: `src/app/(website)/character/shared/page.tsx`

These three pages all need cultures, paths, patronages, disciplines, scores, subscores, and additional scores.

- [ ] **Step 1: Create a shared character data fetcher**

```typescript
// src/lib/fetchCharacterData.ts
import { getPayloadClient } from './payload'

export async function fetchCharacterData() {
  const payload = await getPayloadClient()

  const [cultures, paths, patronages, disciplines, scores, subscores, additionalScores] =
    await Promise.all([
      payload.find({ collection: 'cultures', limit: 100 }),
      payload.find({ collection: 'paths', limit: 100 }),
      payload.find({ collection: 'patronages', limit: 100 }),
      payload.find({
        collection: 'disciplines',
        limit: 100,
        depth: 2, // populate techniques within disciplines
      }),
      payload.find({
        collection: 'scores',
        sort: 'title',
        limit: 100,
        depth: 2, // populate subscores within scores
      }),
      payload.find({ collection: 'subscores', limit: 200, depth: 1 }),
      payload.find({ collection: 'additional-scores', limit: 50, depth: 1 }),
    ])

  return {
    cultures: cultures.docs,
    paths: paths.docs,
    patronages: patronages.docs,
    disciplines: disciplines.docs,
    scores: scores.docs,
    subscores: subscores.docs,
    additionalScores: additionalScores.docs,
  }
}
```

- [ ] **Step 2: Update `character/page.tsx`**

```tsx
// src/app/(website)/character/page.tsx
import Sections from '@/app/components/character/Sections'
import LoadingPage from '@/app/components/global/LoadingPage'
import { fetchCharacterData } from '@/lib/fetchCharacterData'
import { notFound } from 'next/navigation'

const Page = async () => {
  const data = await fetchCharacterData()
  if (!data) return notFound()

  return (
    <main>
      <LoadingPage />
      <Sections
        cultures={data.cultures}
        scores={data.scores}
        additionalScores={data.additionalScores}
        paths={data.paths}
        patronages={data.patronages}
        disciplines={data.disciplines}
        gear={[]} // gear is local — passed from gear-data.ts in Sections component
      />
    </main>
  )
}

export default Page
```

- [ ] **Step 3: Update `generator/page.tsx`**

```tsx
// src/app/(website)/generator/page.tsx
import CharacterGenerator from '@/app/components/character/CharacterGenerator'
import LoadingPage from '@/app/components/global/LoadingPage'
import { fetchCharacterData } from '@/lib/fetchCharacterData'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Character Generator | Atom Magic',
  description: 'Quickly generate characters for NPCs or as a starting point for your own creations in the world of Solum.',
}

const Page = async () => {
  const data = await fetchCharacterData()
  if (!data) return notFound()

  return (
    <main>
      <LoadingPage />
      <CharacterGenerator
        cultures={data.cultures}
        paths={data.paths}
        patronages={data.patronages}
        disciplines={data.disciplines}
        scores={data.scores}
      />
    </main>
  )
}

export default Page
```

- [ ] **Step 4: Update `character/shared/page.tsx`**

```tsx
// src/app/(website)/character/shared/page.tsx
import { Suspense } from 'react'
import { fetchCharacterData } from '@/lib/fetchCharacterData'
import SharedCharacterPageContent from './SharedCharacterPageContent'

function LoadingState() {
  return (
    <main className="notoserif min-h-screen bg-parchment dark:bg-black">
      <div className="container px-6 md:px-8 py-8">
        <div className="text-center py-16">
          <p className="text-stone dark:text-stone-light">Loading character...</p>
        </div>
      </div>
    </main>
  )
}

export default async function SharedCharacterPage() {
  const data = await fetchCharacterData()

  return (
    <Suspense fallback={<LoadingState />}>
      <SharedCharacterPageContent
        cultures={data.cultures}
        paths={data.paths}
        patronages={data.patronages}
        disciplines={data.disciplines}
      />
    </Suspense>
  )
}
```

- [ ] **Step 5: Update component prop types in Sections, CharacterGenerator, SharedCharacterPageContent**

For each component file, replace `CULTURES_QUERY_RESULT` / `PATHS_QUERY_RESULT` etc. with Payload types from `payload-types.ts`:

```typescript
// Example — apply same pattern to each component
import type { Culture, Path, Patronage, Discipline, Score, AdditionalScore } from '../../../../payload-types'
```

Read each component file before editing to confirm exact prop signatures.

- [ ] **Step 6: Verify dev server**

```bash
npm run dev
```

Open `http://localhost:3000/character` — culture/path/discipline selectors should populate.

- [ ] **Step 7: Commit**

```bash
git add src/lib/fetchCharacterData.ts src/app/(website)/character/page.tsx src/app/(website)/generator/page.tsx src/app/(website)/character/shared/page.tsx
git commit -m "feat: migrate character and generator pages to Payload Local API"
```

---

### Task 5: Replace Codex entry and category pages

**Files:**
- Modify: `src/app/(website)/codex/entries/[slug]/page.tsx`
- Modify: `src/app/(website)/codex/categories/[slug]/page.tsx`
- Modify: `src/app/components/codex/UnifiedEntry.tsx`

- [ ] **Step 1: Update `entries/[slug]/page.tsx`**

The `UNIFIED_ENTRY_QUERY` searched across `entry | creature | discipline | technique | path` by slug. In Payload we search each collection and return the first match.

```tsx
// src/app/(website)/codex/entries/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { UnifiedEntry } from '@/app/components/codex/UnifiedEntry'

async function findEntryBySlug(slug: string) {
  const payload = await getPayloadClient()

  const collections = ['entries', 'creatures', 'disciplines', 'techniques', 'paths'] as const

  for (const collection of collections) {
    const result = await payload.find({
      collection,
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
    })
    if (result.docs.length > 0) {
      return { doc: result.docs[0], type: collection }
    }
  }

  return null
}

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const collections = ['entries', 'creatures', 'disciplines', 'techniques', 'paths'] as const
  const slugs: { slug: string }[] = []

  for (const collection of collections) {
    const result = await payload.find({ collection, limit: 500, depth: 0 })
    for (const doc of result.docs) {
      if (doc.slug) slugs.push({ slug: doc.slug as string })
    }
  }

  return slugs
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entry = await findEntryBySlug(slug)
  if (!entry) return notFound()

  return (
    <main>
      <UnifiedEntry entry={entry.doc} entryType={entry.type} />
    </main>
  )
}
```

- [ ] **Step 2: Update `categories/[slug]/page.tsx`**

```tsx
// src/app/(website)/codex/categories/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { Category } from '@/app/components/codex/Category'

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const result = await payload.find({ collection: 'categories', limit: 100, depth: 0 })
  return result.docs.map(cat => ({ slug: cat.slug as string }))
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })

  if (!result.docs.length) return notFound()
  const category = result.docs[0]

  // Find child categories
  const children = await payload.find({
    collection: 'categories',
    where: { parent: { equals: category.id } },
    limit: 50,
    depth: 0,
  })

  // Find all entries in this category across collections
  const collections = ['entries', 'creatures', 'disciplines', 'techniques', 'paths'] as const
  const entries: Array<{ id: string | number; title: string; slug: string; type: string }> = []

  for (const col of collections) {
    const colResult = await payload.find({
      collection: col,
      where: { category: { equals: category.id } },
      limit: 96,
      depth: 0,
    })
    for (const doc of colResult.docs) {
      entries.push({
        id: doc.id,
        title: (doc as { title?: string; name?: string }).title ?? (doc as { name?: string }).name ?? '',
        slug: (doc as { slug?: string }).slug ?? '',
        type: col,
      })
    }
  }

  return (
    <main>
      <Category
        category={category}
        children={children.docs}
        entries={entries}
      />
    </main>
  )
}
```

- [ ] **Step 3: Update `UnifiedEntry` component**

Read `src/app/components/codex/UnifiedEntry.tsx`. Make these changes:

  - Remove `import { urlFor } from '@/sanity/lib/image'` — Payload populates `doc.mainImage.url` directly when `depth >= 1`
  - Replace any markdown renderer with `<RichText content={doc.entryBody} />` from `@/app/components/common/RichText`
  - Update prop types: replace `UNIFIED_ENTRY_QUERY_RESULT` with the Payload `entryType` discriminated union (`Entry | Creature | Discipline | Technique | Path` from `payload-types.ts`)

- [ ] **Step 4: Commit**

```bash
git add src/app/(website)/codex/entries/[slug]/page.tsx src/app/(website)/codex/categories/[slug]/page.tsx src/app/components/codex/UnifiedEntry.tsx
git commit -m "feat: migrate codex entry and category pages to Payload Local API"
```

---

### Task 6: Replace homepage Daily Discovery fetch

**Files:**
- Modify: `src/app/(website)/page.tsx`

The homepage picks a random Codex entry by seeded index. Payload supports `page` + `limit` pagination so we can use `offset` to get a specific item.

- [ ] **Step 1: Update the page**

```tsx
// src/app/(website)/page.tsx
import Hero from '@/app/components/home/Hero'
import FeatureCards from '@/app/components/home/FeatureCards'
import DailyDiscovery from '@/app/components/home/DailyDiscovery'
import { getPayloadClient } from '@/lib/payload'
import { createHash } from 'crypto'
import Srand from 'seeded-rand'

export default async function Home() {
  const payload = await getPayloadClient()

  const countResult = await payload.find({
    collection: 'entries',
    limit: 1,
    depth: 0,
  })
  const total = countResult.totalDocs

  if (!total) {
    return (
      <main className="notoserif">
        <Hero />
        <FeatureCards />
      </main>
    )
  }

  const seed = createHash('sha1')
    .update(String(new Date().getDate().toString()))
    .digest()
    .readUInt32BE()
  const random = new Srand(seed).intInRange(0, total - 1)

  const entryResult = await payload.find({
    collection: 'entries',
    limit: 1,
    depth: 0,
    page: Math.floor(random) + 1, // Payload pages are 1-indexed, each page = 1 doc
  })

  const entry = entryResult.docs[0]

  if (!entry) {
    return (
      <main className="notoserif">
        <Hero />
        <FeatureCards />
      </main>
    )
  }

  return (
    <main className="notoserif">
      <Hero />
      <FeatureCards />
      <DailyDiscovery entry={{ title: entry.title, description: entry.description ?? null, slug: entry.slug }} />
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(website)/page.tsx
git commit -m "feat: migrate homepage daily discovery to Payload Local API"
```

---

### Task 7: Update Algolia route to use Payload hooks

**Files:**
- Create: `src/payload/hooks/algoliaSync.ts`
- Modify: `src/payload/collections/Entries.ts`
- Modify: `src/payload/collections/Creatures.ts`
- Modify: `src/payload/collections/Disciplines.ts`
- Modify: `src/payload/collections/Techniques.ts`
- Modify: `src/payload/collections/Paths.ts`
- Modify: `src/app/api/algolia/route.ts`

The current Algolia route receives Sanity webhooks for incremental updates. With Payload, use collection `hooks` (`afterChange`, `afterDelete`) to push updates to Algolia directly — no webhook endpoint needed for incremental updates.

- [ ] **Step 1: Create shared Algolia indexing hooks**

```typescript
// src/payload/hooks/algoliaSync.ts
import { algoliasearch } from 'algoliasearch'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_API_KEY!
)
const indexName = process.env.ALGOLIA_INDEX_NAME!

export const algoliaAfterChange: CollectionAfterChangeHook = async ({ doc, collection }) => {
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
}

export const algoliaAfterDelete: CollectionAfterDeleteHook = async ({ id }) => {
  await algoliaClient.deleteObject({ indexName, objectID: String(id) })
}
```

- [ ] **Step 2: Add hooks to each searchable collection**

For each of `Entries.ts`, `Creatures.ts`, `Disciplines.ts`, `Techniques.ts`, `Paths.ts`, add to the collection config:

```typescript
// Add this import at the top of each file
import { algoliaAfterChange, algoliaAfterDelete } from '../hooks/algoliaSync'

// Add this property to the CollectionConfig object
hooks: {
  afterChange: [algoliaAfterChange],
  afterDelete: [algoliaAfterDelete],
},
```

Read each collection file before editing to insert in the right place.

- [ ] **Step 3: Simplify the Algolia API route to bulk re-index only**

The incremental path is now handled by Payload hooks. The route only needs to support a one-time full re-index (triggered manually with a secret).

```typescript
// src/app/api/algolia/route.ts
import { algoliasearch } from 'algoliasearch'
import { getPayloadClient } from '@/lib/payload'

const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_API_KEY!
)
const indexName = process.env.ALGOLIA_INDEX_NAME!

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (!secret || secret !== process.env.ALGOLIA_ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayloadClient()
    const collections = ['entries', 'creatures', 'disciplines', 'techniques', 'paths'] as const
    const records: object[] = []

    for (const col of collections) {
      const result = await payload.find({ collection: col, limit: 500, depth: 0 })
      for (const doc of result.docs) {
        records.push({
          objectID: String(doc.id),
          title: (doc as { title?: string; name?: string }).title ?? (doc as { name?: string }).name ?? '',
          path: (doc as { slug?: string }).slug ?? '',
          description: (doc as { description?: string }).description ?? '',
          documentType: col,
        })
      }
    }

    await algoliaClient.saveObjects({ indexName, objects: records })

    return Response.json({ message: `Indexed ${records.length} documents.` })
  } catch (error) {
    console.error('Algolia indexing error:', error instanceof Error ? error.message : error)
    return Response.json({ error: 'Error indexing objects' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Remove Sanity webhook from Sanity dashboard**

In [sanity.io/manage](https://sanity.io/manage), delete the Algolia webhook. This prevents stale calls after migration.

- [ ] **Step 5: Re-run initial Algolia index**

```bash
curl -X POST "http://localhost:3000/api/algolia?secret=YOUR_ALGOLIA_ADMIN_SECRET"
```

Expected: `{ "message": "Indexed N documents." }`

- [ ] **Step 6: Commit**

```bash
git add src/payload/hooks/algoliaSync.ts src/payload/collections/Entries.ts src/payload/collections/Creatures.ts src/payload/collections/Disciplines.ts src/payload/collections/Techniques.ts src/payload/collections/Paths.ts src/app/api/algolia/route.ts
git commit -m "feat: replace Sanity Algolia webhook with Payload collection hooks"
```

---

### Task 8: Update creatures context and roller

**Files:**
- Modify: `src/app/components/creatures/CreatureDataContext.tsx` (or equivalent)

The creature roller fetches creatures. Find the creature data source and replace with Payload.

- [ ] **Step 1: Read the current creature data context**

Read `src/app/components/creatures/CreatureDataContext.tsx` and `src/app/(website)/(creature-tools)/creatures/page.tsx` to find where `sanityFetch(CREATURES_QUERY)` is called.

- [ ] **Step 2: Replace Sanity fetch with Payload in the page or context**

```typescript
const payload = await getPayloadClient()
const result = await payload.find({
  collection: 'creatures',
  sort: 'name',
  limit: 500,
  depth: 0,
})
const creatures = result.docs
```

- [ ] **Step 3: Derive filter values from fetched docs**

The `CREATURE_FILTERS_QUERY` returned unique environments, types, and challenge levels. Replace with:

```typescript
const environments = [
  ...new Set(
    creatures.flatMap(c =>
      c.environments?.map((e: { environment: string }) => e.environment) ?? []
    )
  ),
].filter(Boolean)

const creatureTypes = [...new Set(creatures.map(c => c.creatureType).filter(Boolean))]
const challengeLevels = ['trivial', 'easy', 'moderate', 'hard', 'deadly']
```

- [ ] **Step 4: Update prop types** to use `Creature` from `payload-types.ts`

- [ ] **Step 5: Commit**

```bash
git add src/app/components/creatures/ src/app/(website)/\(creature-tools\)/creatures/page.tsx
git commit -m "feat: migrate creature roller to Payload Local API"
```

---

### Task 9: Remove Sanity packages and files

**Files:**
- Delete: `src/sanity/` (entire directory)
- Delete: `src/app/(studio)/` (entire directory)
- Delete: `sanity.types.ts`
- Delete: `sanity.config.ts` (if exists at root)
- Modify: `package.json` (remove Sanity deps)

- [ ] **Step 1: Verify no remaining Sanity imports**

```bash
grep -r "from '@sanity" src/app src/lib --include="*.ts" --include="*.tsx"
grep -r "from 'next-sanity'" src/app src/lib --include="*.ts" --include="*.tsx"
grep -r "sanity/lib" src/app src/lib --include="*.ts" --include="*.tsx"
grep -r "sanity.types" src/app src/lib --include="*.ts" --include="*.tsx"
```

Expected: no output. Fix any remaining imports before proceeding.

- [ ] **Step 2: Delete Sanity directories and files**

```bash
rm -rf src/sanity
rm -rf "src/app/(studio)"
rm -f sanity.types.ts
rm -f sanity.config.ts
```

- [ ] **Step 3: Uninstall Sanity packages**

```bash
npm uninstall next-sanity @sanity/client @sanity/icons @sanity/image-url sanity sanity-plugin-markdown @sanity/webhook
```

- [ ] **Step 4: Run build to verify no broken imports**

```bash
npm run build
```

Expected: build succeeds with no TypeScript or module resolution errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: remove Sanity CMS — migration to Payload complete"
```

---

### Task 10: Verify full application

- [ ] **Step 1: Run dev server and smoke test all pages**

```bash
npm run dev
```

Check each route:
- `http://localhost:3000/` — Hero, Feature Cards, Daily Discovery entry visible
- `http://localhost:3000/character` — Culture/Path/Patronage/Discipline selectors populated
- `http://localhost:3000/generator` — same selectors work
- `http://localhost:3000/codex` — static page, Algolia search works
- `http://localhost:3000/codex/timeline` — events sorted by year
- `http://localhost:3000/codex/entries/[any-slug]` — entry body renders as rich text
- `http://localhost:3000/codex/categories/gameplay` — entry list renders
- `http://localhost:3000/creatures` — creature roller populated
- `http://localhost:3000/admin` — Payload admin UI accessible

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: build succeeds, no TypeScript errors, all `generateStaticParams` routes resolved.

- [ ] **Step 3: Commit final state**

```bash
git add -A
git commit -m "feat: complete Sanity to Payload CMS migration"
```

---

**Migration complete.** The app now uses Payload CMS with Neon Postgres and Vercel Blob. The Sanity dependency chain is fully removed. The admin UI is at `/admin`. Algolia search is kept and updated to use Payload hooks for incremental indexing.
