# Payload CMS Data Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Export all content from Sanity, convert markdown fields to Lexical JSON, download and re-upload images to Vercel Blob, and seed all Payload collections via the Local API.

**Architecture:** A single Node.js migration script (`scripts/migrate-from-sanity.ts`) runs once against a live Sanity dataset and a running Payload instance. It handles ordering (parent-before-child collections), image re-upload, and markdown → Lexical conversion. The script is idempotent: running it twice will create duplicates, so run it once against a clean Payload DB.

**Prerequisite:** Sub-plan 1 (Payload Setup & Collections) must be complete and the dev server must be running (`npm run dev`) when the script executes, since it uses Payload's Local API.

**Tech Stack:** `@sanity/client`, `@payloadcms/richtext-lexical` (`convertMarkdownToLexical`), Payload Local API, `node-fetch` (or native `fetch`) for image download

---

## File Structure

**New files to create:**
- `scripts/migrate-from-sanity.ts` — main migration script
- `scripts/migrate-runner.mjs` — thin ESM wrapper to run the TS script via tsx

---

### Task 1: Install migration script dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install tsx for running TypeScript scripts**

```bash
npm install --save-dev tsx
```

- [ ] **Step 2: Add migration script to package.json**

In `package.json`, add to `"scripts"`:

```json
"migrate": "tsx scripts/migrate-from-sanity.ts"
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add tsx for migration script runner"
```

---

### Task 2: Write the Sanity export helpers

**Files:**
- Create: `scripts/migrate-from-sanity.ts` (partial — Sanity fetch helpers)

- [ ] **Step 1: Create the script with Sanity client and fetch helpers**

```typescript
// scripts/migrate-from-sanity.ts
import { createClient } from '@sanity/client'
import { convertMarkdownToLexical } from '@payloadcms/richtext-lexical'
import { getPayload } from 'payload'
import config from '../payload.config'
import path from 'path'
import fs from 'fs'

// ---- Sanity client --------------------------------------------------------

const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET ?? 'production',
  apiVersion: '2024-08-20',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN, // read token for private datasets
})

// ---- Helpers ---------------------------------------------------------------

/** Convert a markdown string to Lexical JSON, or return null if empty. */
function md(markdown: string | null | undefined) {
  if (!markdown) return null
  return convertMarkdownToLexical({ markdown })
}

/** Download an image from a URL and return it as a Buffer with filename. */
async function downloadImage(url: string, filename: string): Promise<{ buffer: Buffer; filename: string }> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download image: ${url} (${res.status})`)
  const buffer = Buffer.from(await res.arrayBuffer())
  return { buffer, filename }
}

/** Build a Sanity CDN image URL from a Sanity image reference. */
function sanityImageUrl(ref: { asset?: { _ref?: string } } | null | undefined): string | null {
  if (!ref?.asset?._ref) return null
  // Sanity ref format: image-<id>-<dimensions>-<format>
  const [, id, dimensions, format] = ref.asset._ref.split('-')
  return `https://cdn.sanity.io/images/${process.env.SANITY_PROJECT_ID}/${process.env.SANITY_DATASET ?? 'production'}/${id}-${dimensions}.${format}`
}

// ---- ID map: Sanity _id → Payload id ---------------------------------------
// Used to resolve relationships after seeding each collection.
const idMap = new Map<string, number | string>()

console.log('Migration script loaded. Starting...')
```

- [ ] **Step 2: Commit**

```bash
git add scripts/migrate-from-sanity.ts
git commit -m "chore: scaffold migration script with Sanity client and helpers"
```

---

### Task 3: Add image upload helper

**Files:**
- Modify: `scripts/migrate-from-sanity.ts`

- [ ] **Step 1: Add the `uploadImage` function after the helpers block**

This function downloads a Sanity image, saves it to a temp file, and uploads it to Payload's media collection:

```typescript
/** Upload a Sanity image asset to Payload media collection. Returns Payload media id or null. */
async function uploadImage(
  payload: Awaited<ReturnType<typeof getPayload>>,
  sanityImageRef: { asset?: { _ref?: string } } | null | undefined,
  altText?: string
): Promise<number | string | null> {
  const url = sanityImageUrl(sanityImageRef)
  if (!url) return null

  const filename = url.split('/').pop()!
  const { buffer } = await downloadImage(url, filename)

  // Write to temp file — Payload's Local API upload requires a file path
  const tmpPath = path.join('/tmp', filename)
  fs.writeFileSync(tmpPath, buffer)

  try {
    const media = await payload.create({
      collection: 'media',
      data: { alt: altText ?? '' },
      filePath: tmpPath,
    })
    return media.id
  } finally {
    fs.unlinkSync(tmpPath)
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/migrate-from-sanity.ts
git commit -m "chore: add image upload helper to migration script"
```

---

### Task 4: Migrate Categories

**Files:**
- Modify: `scripts/migrate-from-sanity.ts`

- [ ] **Step 1: Add `migrateCategories` function**

Categories are self-referential (parent → child). Run two passes: first create all without parents, then update with parent relationships.

```typescript
async function migrateCategories(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('Migrating categories...')
  const docs = await sanity.fetch<Array<{
    _id: string; title: string; slug: { current: string }; description?: string;
    parent?: { _ref: string }
  }>>(`*[_type == "category"]{ _id, title, slug, description, parent }`)

  // Pass 1: create all without parent
  for (const doc of docs) {
    const created = await payload.create({
      collection: 'categories',
      data: {
        title: doc.title ?? '',
        slug: doc.slug?.current ?? '',
        description: doc.description ?? '',
      },
    })
    idMap.set(doc._id, created.id)
    console.log(`  Created category: ${doc.title}`)
  }

  // Pass 2: set parent relationships
  for (const doc of docs) {
    if (!doc.parent?._ref) continue
    const parentId = idMap.get(doc.parent._ref)
    if (!parentId) continue
    await payload.update({
      collection: 'categories',
      id: idMap.get(doc._id) as string | number,
      data: { parent: parentId },
    })
  }

  console.log(`  Done: ${docs.length} categories`)
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/migrate-from-sanity.ts
git commit -m "chore: add migrateCategories to migration script"
```

---

### Task 5: Migrate Scores and Subscores

**Files:**
- Modify: `scripts/migrate-from-sanity.ts`

- [ ] **Step 1: Add `migrateScores` function**

Scores must be created before Subscores (Subscores reference Scores).

```typescript
async function migrateScores(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('Migrating scores...')
  const docs = await sanity.fetch<Array<{
    _id: string; title: string; id?: string; description?: string
  }>>(`*[_type == "score"]{ _id, title, id, description }`)

  for (const doc of docs) {
    const created = await payload.create({
      collection: 'scores',
      data: {
        title: doc.title ?? '',
        scoreId: doc.id ?? '',
        description: md(doc.description),
      },
    })
    idMap.set(doc._id, created.id)
    console.log(`  Created score: ${doc.title}`)
  }
  console.log(`  Done: ${docs.length} scores`)
}

async function migrateSubscores(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('Migrating subscores...')
  const docs = await sanity.fetch<Array<{
    _id: string; title: string; id?: string; defaultValue?: number;
    description?: string; score?: { _ref: string }
  }>>(`*[_type == "subscore"]{ _id, title, id, defaultValue, description, score }`)

  for (const doc of docs) {
    const created = await payload.create({
      collection: 'subscores',
      data: {
        title: doc.title ?? '',
        subscoreId: doc.id ?? '',
        defaultValue: doc.defaultValue,
        description: md(doc.description),
        score: doc.score?._ref ? idMap.get(doc.score._ref) : undefined,
      },
    })
    idMap.set(doc._id, created.id)
    console.log(`  Created subscore: ${doc.title}`)
  }
  console.log(`  Done: ${docs.length} subscores`)
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/migrate-from-sanity.ts
git commit -m "chore: add migrateScores and migrateSubscores to migration script"
```

---

### Task 6: Migrate Categories, Entries shell, and Paths

**Files:**
- Modify: `scripts/migrate-from-sanity.ts`

- [ ] **Step 1: Add `migrateEntries` function**

Entries reference categories and users. Since users won't exist in Payload from Sanity (they're admin accounts), skip the author relationship.

```typescript
async function migrateEntries(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('Migrating entries...')
  const docs = await sanity.fetch<Array<{
    _id: string; title: string; slug: { current: string }; description?: string;
    toc?: string; entryBody?: string; publishedAt?: string;
    mainImage?: { asset?: { _ref?: string }; alt?: string };
    category?: { _ref: string };
    cardDetails?: Array<{ detailName?: string; detailDescription?: string }>
  }>>(`*[_type == "entry"]{ _id, title, slug, description, toc, entryBody, publishedAt, mainImage, category, cardDetails }`)

  for (const doc of docs) {
    const mediaId = await uploadImage(payload, doc.mainImage, doc.mainImage?.alt)
    const created = await payload.create({
      collection: 'entries',
      data: {
        title: doc.title ?? '',
        slug: doc.slug?.current ?? '',
        description: doc.description ?? '',
        toc: md(doc.toc),
        entryBody: md(doc.entryBody),
        publishedAt: doc.publishedAt,
        mainImage: mediaId ?? undefined,
        category: doc.category?._ref ? idMap.get(doc.category._ref) : undefined,
        cardDetails: doc.cardDetails?.map(d => ({
          detailName: d.detailName ?? '',
          detailDescription: d.detailDescription ?? '',
        })) ?? [],
      },
    })
    idMap.set(doc._id, created.id)
    console.log(`  Created entry: ${doc.title}`)
  }
  console.log(`  Done: ${docs.length} entries`)
}
```

- [ ] **Step 2: Add `migratePaths` function**

Paths reference subscores in their modifiers.

```typescript
async function migratePaths(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('Migrating paths...')
  const docs = await sanity.fetch<Array<{
    _id: string; title: string; latin?: string; slug: { current: string };
    description?: string; toc?: string; entryBody?: string;
    mainImage?: { asset?: { _ref?: string }; alt?: string };
    category?: { _ref: string };
    modifiers?: Array<{ modifierSubscore?: { _ref: string }; modifierValue?: number }>
  }>>(`*[_type == "path"]{ _id, title, latin, slug, description, toc, entryBody, mainImage, category, modifiers[]{modifierSubscore, modifierValue} }`)

  for (const doc of docs) {
    const mediaId = await uploadImage(payload, doc.mainImage, doc.mainImage?.alt)
    const created = await payload.create({
      collection: 'paths',
      data: {
        title: doc.title ?? '',
        latin: doc.latin ?? '',
        slug: doc.slug?.current ?? '',
        description: md(doc.description),
        toc: md(doc.toc),
        entryBody: md(doc.entryBody),
        mainImage: mediaId ?? undefined,
        category: doc.category?._ref ? idMap.get(doc.category._ref) : undefined,
        modifiers: doc.modifiers?.map(m => ({
          modifierSubscore: m.modifierSubscore?._ref ? idMap.get(m.modifierSubscore._ref) : undefined,
          modifierValue: m.modifierValue,
        })) ?? [],
      },
    })
    idMap.set(doc._id, created.id)
    console.log(`  Created path: ${doc.title}`)
  }
  console.log(`  Done: ${docs.length} paths`)
}
```

- [ ] **Step 3: Commit**

```bash
git add scripts/migrate-from-sanity.ts
git commit -m "chore: add migrateEntries and migratePaths to migration script"
```

---

### Task 7: Migrate Techniques, Disciplines, and Cultures

**Files:**
- Modify: `scripts/migrate-from-sanity.ts`

- [ ] **Step 1: Add `migrateTechniques` function**

```typescript
async function migrateTechniques(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('Migrating techniques...')
  const docs = await sanity.fetch<Array<{
    _id: string; title: string; latin?: string; slug: { current: string };
    cooldown?: number; description?: string; toc?: string; entryBody?: string;
    mainImage?: { asset?: { _ref?: string }; alt?: string };
    category?: { _ref: string }
  }>>(`*[_type == "technique"]{ _id, title, latin, slug, cooldown, description, toc, entryBody, mainImage, category }`)

  for (const doc of docs) {
    const mediaId = await uploadImage(payload, doc.mainImage, doc.mainImage?.alt)
    const created = await payload.create({
      collection: 'techniques',
      data: {
        title: doc.title ?? '',
        latin: doc.latin ?? '',
        slug: doc.slug?.current ?? '',
        cooldown: doc.cooldown,
        description: md(doc.description),
        toc: md(doc.toc),
        entryBody: md(doc.entryBody),
        mainImage: mediaId ?? undefined,
        category: doc.category?._ref ? idMap.get(doc.category._ref) : undefined,
      },
    })
    idMap.set(doc._id, created.id)
    console.log(`  Created technique: ${doc.title}`)
  }
  console.log(`  Done: ${docs.length} techniques`)
}
```

- [ ] **Step 2: Add `migrateDisciplines` function**

```typescript
async function migrateDisciplines(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('Migrating disciplines...')
  const docs = await sanity.fetch<Array<{
    _id: string; title: string; slug: { current: string };
    description?: string; toc?: string; entryBody?: string;
    mainImage?: { asset?: { _ref?: string }; alt?: string };
    category?: { _ref: string };
    paths?: Array<{ _ref: string }>;
    techniques?: Array<{ _ref: string }>
  }>>(`*[_type == "discipline"]{ _id, title, slug, description, toc, entryBody, mainImage, category, paths, techniques }`)

  for (const doc of docs) {
    const mediaId = await uploadImage(payload, doc.mainImage, doc.mainImage?.alt)
    const created = await payload.create({
      collection: 'disciplines',
      data: {
        title: doc.title ?? '',
        slug: doc.slug?.current ?? '',
        description: md(doc.description),
        toc: md(doc.toc),
        entryBody: md(doc.entryBody),
        mainImage: mediaId ?? undefined,
        category: doc.category?._ref ? idMap.get(doc.category._ref) : undefined,
        paths: doc.paths?.map(p => idMap.get(p._ref)).filter(Boolean) ?? [],
        techniques: doc.techniques?.map(t => idMap.get(t._ref)).filter(Boolean) ?? [],
      },
    })
    idMap.set(doc._id, created.id)
    console.log(`  Created discipline: ${doc.title}`)
  }
  console.log(`  Done: ${docs.length} disciplines`)
}
```

- [ ] **Step 3: Add `migrateCultures` function**

```typescript
async function migrateCultures(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('Migrating cultures...')
  const docs = await sanity.fetch<Array<{
    _id: string; title: string; description?: string;
    mainImage?: { asset?: { _ref?: string }; alt?: string };
    entry?: { _ref: string };
    aspects?: Array<{
      aspectName?: string; aspectId?: string;
      aspectContentSlug?: string; aspectDescription?: string
    }>
  }>>(`*[_type == "culture"]{ _id, title, description, mainImage, entry, aspects }`)

  for (const doc of docs) {
    const mediaId = await uploadImage(payload, doc.mainImage, doc.mainImage?.alt)
    const created = await payload.create({
      collection: 'cultures',
      data: {
        title: doc.title ?? '',
        description: md(doc.description),
        mainImage: mediaId ?? undefined,
        entry: doc.entry?._ref ? idMap.get(doc.entry._ref) : undefined,
        aspects: doc.aspects?.map(a => ({
          aspectName: a.aspectName ?? '',
          aspectId: a.aspectId ?? '',
          aspectContentSlug: a.aspectContentSlug ?? '',
          aspectDescription: md(a.aspectDescription),
        })) ?? [],
      },
    })
    idMap.set(doc._id, created.id)
    console.log(`  Created culture: ${doc.title}`)
  }
  console.log(`  Done: ${docs.length} cultures`)
}
```

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate-from-sanity.ts
git commit -m "chore: add migrateTechniques, migrateDisciplines, migrateCultures"
```

---

### Task 8: Migrate Patronages, Enhancements, AdditionalScores, Creatures, Timeline

**Files:**
- Modify: `scripts/migrate-from-sanity.ts`

- [ ] **Step 1: Add `migratePatronages` function**

```typescript
async function migratePatronages(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('Migrating patronages...')
  const docs = await sanity.fetch<Array<{
    _id: string; title: string; titleLatin?: string; epithet?: string; epithetLatin?: string;
    description?: string;
    mainImage?: { asset?: { _ref?: string }; alt?: string };
    entry?: { _ref: string };
    effects?: Array<{ title?: string; titleLatin?: string; description?: string; entry?: { _ref: string } }>
  }>>(`*[_type == "patronage"]{ _id, title, titleLatin, epithet, epithetLatin, description, mainImage, entry, effects[]{title, titleLatin, description, entry} }`)

  for (const doc of docs) {
    const mediaId = await uploadImage(payload, doc.mainImage, doc.mainImage?.alt)
    const created = await payload.create({
      collection: 'patronages',
      data: {
        title: doc.title ?? '',
        titleLatin: doc.titleLatin ?? '',
        epithet: doc.epithet ?? '',
        epithetLatin: doc.epithetLatin ?? '',
        description: md(doc.description),
        mainImage: mediaId ?? undefined,
        entry: doc.entry?._ref ? idMap.get(doc.entry._ref) : undefined,
        effects: doc.effects?.map(e => ({
          title: e.title ?? '',
          titleLatin: e.titleLatin ?? '',
          description: md(e.description),
          entry: e.entry?._ref ? idMap.get(e.entry._ref) : undefined,
        })) ?? [],
      },
    })
    idMap.set(doc._id, created.id)
    console.log(`  Created patronage: ${doc.title}`)
  }
  console.log(`  Done: ${docs.length} patronages`)
}
```

- [ ] **Step 2: Add `migrateEnhancements` function**

```typescript
async function migrateEnhancements(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('Migrating enhancements...')
  const docs = await sanity.fetch<Array<{
    _id: string; title: string; latin?: string; cooldown?: number; description?: string;
    entry?: { _ref: string }
  }>>(`*[_type == "enhancement"]{ _id, title, latin, cooldown, description, entry }`)

  for (const doc of docs) {
    const created = await payload.create({
      collection: 'enhancements',
      data: {
        title: doc.title ?? '',
        latin: doc.latin ?? '',
        cooldown: doc.cooldown,
        description: md(doc.description),
        entry: doc.entry?._ref ? idMap.get(doc.entry._ref) : undefined,
      },
    })
    idMap.set(doc._id, created.id)
    console.log(`  Created enhancement: ${doc.title}`)
  }
  console.log(`  Done: ${docs.length} enhancements`)
}
```

- [ ] **Step 3: Add `migrateAdditionalScores` function**

```typescript
async function migrateAdditionalScores(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('Migrating additional scores...')
  const docs = await sanity.fetch<Array<{
    _id: string; title: string; description?: string; calculation: string;
    entry?: { _ref: string };
    scores?: Array<{ _ref: string; _type: string }>;
    additionalCalculations?: Array<{ calculationType: string; value: number }>
  }>>(`*[_type == "additionalScores"]{ _id, title, description, calculation, entry, scores, additionalCalculations }`)

  for (const doc of docs) {
    const created = await payload.create({
      collection: 'additional-scores',
      data: {
        title: doc.title ?? '',
        description: md(doc.description),
        calculation: doc.calculation,
        entry: doc.entry?._ref ? idMap.get(doc.entry._ref) : undefined,
        scores: doc.scores?.map(s => ({
          relationTo: s._type === 'score' ? 'scores' : 'subscores',
          value: idMap.get(s._ref),
        })).filter(s => s.value) ?? [],
        additionalCalculations: doc.additionalCalculations ?? [],
      },
    })
    idMap.set(doc._id, created.id)
    console.log(`  Created additional score: ${doc.title}`)
  }
  console.log(`  Done: ${docs.length} additional scores`)
}
```

- [ ] **Step 4: Add `migrateCreatures` function**

```typescript
async function migrateCreatures(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('Migrating creatures...')
  const docs = await sanity.fetch<Array<{
    _id: string; name: string; slug: { current: string }; description?: string;
    physical?: number; interpersonal?: number; intellect?: number; psyche?: number;
    health?: number; physicalShield?: number; psychicShield?: number; armorCapacity?: number;
    challengeLevel?: string; creatureType?: string; isSwarm?: boolean; isUnique?: boolean;
    environments?: string[]; toc?: string; entryBody?: string;
    mainImage?: { asset?: { _ref?: string }; alt?: string };
    category?: { _ref: string };
    attacks?: Array<{ name: string; damage?: string }>;
    specialAbilities?: Array<{ name: string; description?: string }>
  }>>(`*[_type == "creature"]{ _id, name, slug, description, physical, interpersonal, intellect, psyche, health, physicalShield, psychicShield, armorCapacity, challengeLevel, creatureType, isSwarm, isUnique, environments, toc, entryBody, mainImage, category, attacks, specialAbilities }`)

  for (const doc of docs) {
    const mediaId = await uploadImage(payload, doc.mainImage, doc.mainImage?.alt)
    const created = await payload.create({
      collection: 'creatures',
      data: {
        name: doc.name ?? '',
        slug: doc.slug?.current ?? '',
        description: doc.description ?? '',
        physical: doc.physical ?? 10,
        interpersonal: doc.interpersonal ?? 10,
        intellect: doc.intellect ?? 10,
        psyche: doc.psyche ?? 10,
        health: doc.health,
        physicalShield: doc.physicalShield,
        psychicShield: doc.psychicShield,
        armorCapacity: doc.armorCapacity,
        challengeLevel: doc.challengeLevel ?? 'moderate',
        creatureType: doc.creatureType ?? '',
        isSwarm: doc.isSwarm ?? false,
        isUnique: doc.isUnique ?? false,
        environments: doc.environments?.map(e => ({ environment: e })) ?? [],
        toc: md(doc.toc),
        entryBody: md(doc.entryBody),
        mainImage: mediaId ?? undefined,
        category: doc.category?._ref ? idMap.get(doc.category._ref) : undefined,
        attacks: doc.attacks?.map(a => ({ name: a.name, damage: a.damage ?? '' })) ?? [],
        specialAbilities: doc.specialAbilities?.map(a => ({ name: a.name, description: a.description ?? '' })) ?? [],
      },
    })
    idMap.set(doc._id, created.id)
    console.log(`  Created creature: ${doc.name}`)
  }
  console.log(`  Done: ${docs.length} creatures`)
}
```

- [ ] **Step 5: Add `migrateTimeline` function**

```typescript
async function migrateTimeline(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('Migrating timeline...')
  const docs = await sanity.fetch<Array<{
    _id: string; title: string; year: number; major?: boolean;
    icon?: string; description?: string; URL?: string
  }>>(`*[_type == "timeline"]{ _id, title, year, major, icon, description, URL }`)

  for (const doc of docs) {
    const created = await payload.create({
      collection: 'timeline',
      data: {
        title: doc.title ?? '',
        year: doc.year,
        major: doc.major ?? false,
        icon: doc.icon,
        description: doc.description ?? '',
        url: doc.URL ?? '',
      },
    })
    idMap.set(doc._id, created.id)
    console.log(`  Created timeline event: ${doc.title} (${doc.year})`)
  }
  console.log(`  Done: ${docs.length} timeline events`)
}
```

- [ ] **Step 6: Commit**

```bash
git add scripts/migrate-from-sanity.ts
git commit -m "chore: add all remaining collection migrators to migration script"
```

---

### Task 9: Write the main migration orchestrator

**Files:**
- Modify: `scripts/migrate-from-sanity.ts`

- [ ] **Step 1: Add the `main` function at the bottom of the script**

Order matters: parent collections before child collections (e.g., Scores before Subscores, Categories before Entries, Paths before Disciplines).

```typescript
async function main() {
  const payload = await getPayload({ config })

  try {
    // Dependency order: most things reference categories and entries
    await migrateCategories(payload)
    await migrateScores(payload)
    await migrateSubscores(payload)
    await migrateEntries(payload)
    await migratePaths(payload)
    await migrateTechniques(payload)
    await migrateDisciplines(payload)
    await migrateCultures(payload)
    await migratePatronages(payload)
    await migrateEnhancements(payload)
    await migrateAdditionalScores(payload)
    await migrateCreatures(payload)
    await migrateTimeline(payload)

    console.log('\nMigration complete!')
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

main()
```

- [ ] **Step 2: Commit**

```bash
git add scripts/migrate-from-sanity.ts
git commit -m "chore: add main orchestrator to migration script"
```

---

### Task 10: Run the migration

- [ ] **Step 1: Ensure required env vars are set**

The script needs both Sanity and Payload env vars. Verify `.env.local` contains:

```
SANITY_PROJECT_ID=...
SANITY_DATASET=production
SANITY_API_READ_TOKEN=...   # Already in .env.local
DATABASE_URL=...            # Already set by Neon integration
PAYLOAD_SECRET=...
BLOB_READ_WRITE_TOKEN=...
```

Get a Sanity read token from [sanity.io/manage](https://sanity.io/manage) → your project → API → Tokens → Add token (Viewer).

- [ ] **Step 2: Start the dev server** (in a separate terminal)

```bash
npm run dev
```

Wait until `ready - started server on 0.0.0.0:3000`.

- [ ] **Step 3: Run the migration script**

```bash
npm run migrate
```

Watch the output for any errors. Expected: each collection logs creation lines, ends with "Migration complete!".

- [ ] **Step 4: Verify in Payload admin**

Open `http://localhost:3000/admin` and spot-check:
- Categories: expected count matches Sanity
- Entries: check a few for `entryBody` showing rich text (not raw markdown)
- Cultures: check aspects have rich text descriptions
- Creatures: check scores, attacks, special abilities

- [ ] **Step 5: Commit the migration script (no data committed — DB is external)**

```bash
git add scripts/migrate-from-sanity.ts
git commit -m "chore: complete Sanity-to-Payload migration script"
```

---

**Sub-plan 2 complete.** All Sanity content is now in Payload. Images are in Vercel Blob. Markdown fields are Lexical rich text. Proceed to sub-plan 3 (app code migration).
