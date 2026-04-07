import { config as dotenvConfig } from 'dotenv'
dotenvConfig({ path: '.env.local' })

import { createClient } from '@sanity/client'
import { convertMarkdownToLexical, sanitizeServerEditorConfig, defaultEditorConfig } from '@payloadcms/richtext-lexical'
import { getPayload } from 'payload'
import path from 'path'
import fs from 'fs'

// ---- Sanity client --------------------------------------------------------

const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET ?? 'production',
  apiVersion: '2024-08-20',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
})

// ---- Helpers ---------------------------------------------------------------

// Populated in main() after Payload initializes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let editorConfig: any

/** Convert a markdown string to Lexical JSON, or return null if empty. */
function md(markdown: string | null | undefined) {
  if (!markdown) return null
  return convertMarkdownToLexical({ markdown, editorConfig })
}

/** Build a Sanity CDN image URL from a Sanity image reference. */
function sanityImageUrl(ref: { asset?: { _ref?: string } } | null | undefined): string | null {
  if (!ref?.asset?._ref) return null
  // Sanity ref format: image-<id>-<dimensions>-<format>
  const parts = ref.asset._ref.split('-')
  // parts: ['image', id, dimensions, format]
  const id = parts[1]
  const format = parts[parts.length - 1]
  const dimensions = parts.slice(2, parts.length - 1).join('-')
  return `https://cdn.sanity.io/images/${process.env.SANITY_PROJECT_ID}/${process.env.SANITY_DATASET ?? 'production'}/${id}-${dimensions}.${format}`
}

// ---- ID map: Sanity _id → Payload id ---------------------------------------
const idMap = new Map<string, number | string>()

// ---- Image upload ----------------------------------------------------------

/** Upload a Sanity image asset to Payload media collection. Returns Payload media id or null. */
async function uploadImage(
  payload: Awaited<ReturnType<typeof getPayload>>,
  sanityImageRef: { asset?: { _ref?: string } } | null | undefined,
  altText?: string
): Promise<number | string | null> {
  const url = sanityImageUrl(sanityImageRef)
  if (!url) return null

  const filename = url.split('/').pop()!

  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`  Warning: Could not download image ${url} (${res.status}) — skipping`)
      return null
    }
    const buffer = Buffer.from(await res.arrayBuffer())
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
  } catch (err) {
    console.warn(`  Warning: Image upload failed for ${url} — skipping. Error: ${err}`)
    return null
  }
}

// ---- Collection migrators --------------------------------------------------

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
        slug: doc.slug?.current || undefined,
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
        slug: doc.slug?.current || undefined,
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
        slug: doc.slug?.current || undefined,
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
        slug: doc.slug?.current || undefined,
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
        slug: doc.slug?.current || undefined,
        description: md(doc.description),
        toc: md(doc.toc),
        entryBody: md(doc.entryBody),
        mainImage: mediaId ?? undefined,
        category: doc.category?._ref ? idMap.get(doc.category._ref) : undefined,
        paths: (doc.paths?.map(p => idMap.get(p._ref)).filter(Boolean) ?? []) as (string | number)[],
        techniques: (doc.techniques?.map(t => idMap.get(t._ref)).filter(Boolean) ?? []) as (string | number)[],
      },
    })
    idMap.set(doc._id, created.id)
    console.log(`  Created discipline: ${doc.title}`)
  }
  console.log(`  Done: ${docs.length} disciplines`)
}

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

async function migrateAdditionalScores(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('Migrating additional scores...')
  const docs = await sanity.fetch<Array<{
    _id: string; title: string; description?: string; calculation: string;
    entry?: { _ref: string };
    scores?: Array<{ ref: string; docType: string }>;
    additionalCalculations?: Array<{ calculationType: string; value: number }>
  }>>(`*[_type == "additionalScores"]{ _id, title, description, calculation, entry, "scores": scores[]{ "ref": _ref, "docType": @->._type }, additionalCalculations }`)

  for (const doc of docs) {
    const created = await payload.create({
      collection: 'additional-scores',
      data: {
        title: doc.title ?? '',
        description: md(doc.description),
        calculation: doc.calculation,
        entry: doc.entry?._ref ? idMap.get(doc.entry._ref) : undefined,
        scores: doc.scores?.map(s => ({
          relationTo: s.docType === 'score' ? 'scores' : 'subscores',
          value: idMap.get(s.ref),
        })).filter(s => s.value) ?? [],
        additionalCalculations: doc.additionalCalculations ?? [],
      },
    })
    idMap.set(doc._id, created.id)
    console.log(`  Created additional score: ${doc.title}`)
  }
  console.log(`  Done: ${docs.length} additional scores`)
}

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
        slug: doc.slug?.current || undefined,
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

async function migrateTimeline(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('Migrating timeline...')
  const docs = await sanity.fetch<Array<{
    _id: string; title: string; year: number; major?: boolean;
    icon?: string; description?: string; URL?: string
  }>>(`*[_type == "timeline"]{ _id, title, year, major, icon, description, URL }`)

  for (const doc of docs) {
    await payload.create({
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
    console.log(`  Created timeline event: ${doc.title} (${doc.year})`)
  }
  console.log(`  Done: ${docs.length} timeline events`)
}

// ---- Main orchestrator -----------------------------------------------------

type PayloadInstance = Awaited<ReturnType<typeof getPayload>>

async function clearAll(payload: PayloadInstance) {
  console.log('Clearing existing data...')
  const collections = [
    'timeline', 'creatures', 'additional-scores', 'enhancements', 'patronages',
    'cultures', 'disciplines', 'techniques', 'paths', 'entries',
    'subscores', 'scores', 'categories', 'media',
  ] as const
  for (const col of collections) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { docs } = await (payload as any).find({ collection: col, limit: 1000, depth: 0 })
    for (const doc of docs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (payload as any).delete({ collection: col, id: doc.id })
    }
    if (docs.length > 0) console.log(`  Cleared ${docs.length} from ${col}`)
  }
  console.log('Done clearing.\n')
}

async function main() {
  console.log('Connecting to Payload...')
  const { default: config } = await import('../payload.config.js')
  const payload = await getPayload({ config })
  editorConfig = await sanitizeServerEditorConfig(defaultEditorConfig, payload.config)
  console.log('Connected.\n')

  await clearAll(payload)

  try {
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
