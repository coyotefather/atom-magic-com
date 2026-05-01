/**
 * Creatures.ts
 *
 * Payload CMS collection config for creatures — the monsters and NPCs used
 * in the creature roller, encounter builder, and Creature Manager.
 *
 * What a creature document contains:
 *   Every creature has core combat/game stats (scores, health, shields, armor),
 *   a list of attacks with damage expressions, a list of special abilities with
 *   descriptions, and classification tags for filtering. Creatures also have
 *   a full Codex article body (toc + entryBody) for in-depth lore.
 *
 * Key differences from Entries:
 *   - Uses `name` instead of `title` as the admin display field. This is why
 *     queries on this collection use `doc.name` rather than `doc.title`, and
 *     why the normalizer in `creature-types.ts` handles this field differently.
 *   - Has numeric score fields (physical, interpersonal, intellect, psyche)
 *     that map directly to the four core character/creature scores in the game.
 *   - Has an `environments` array (each item is a `{ environment: string }` object,
 *     not a flat string array) — the normalizer in `creature-types.ts` flattens this.
 *
 * Fields:
 *   - `name`            — Display name (used in roller cards, encounter builder, search)
 *   - `slug`            — URL-safe identifier, used for the Codex entry URL
 *   - `description`     — Short 1-2 sentence plain text description shown in roller cards
 *   - `mainImage`       — Optional image (stored in Vercel Blob via Media)
 *   - `physical`, `interpersonal`, `intellect`, `psyche` — Core scores (default 10)
 *   - `health`          — Hit points
 *   - `physicalShield`  — Physical damage absorber (separate from health)
 *   - `psychicShield`   — Psychic damage absorber (separate from health)
 *   - `armorCapacity`   — Armor damage pool (absorbed after shields are depleted)
 *   - `attacks`         — Array of attack entries (name + damage expression like "2d6+3")
 *   - `specialAbilities` — Array of ability entries (name + text description)
 *   - `challengeLevel`  — Difficulty rating: harmless/trivial/easy/moderate/hard/deadly
 *   - `creatureType`    — Free-text category (e.g., "Beast", "Construct", "Humanoid")
 *   - `environments`    — Array of habitat strings (e.g., "Forest", "Mountains")
 *   - `isSwarm`         — Whether this creature fights as a group/swarm
 *   - `isUnique`        — Whether this is a named individual (boss/villain) vs. a generic type
 *   - `category`        — Codex category for organizing in the Codex index
 *   - `toc`             — Rich text table of contents for the Codex article
 *   - `entryBody`       — Full Codex article body as Lexical rich text
 *
 * Access control:
 *   - Read: public (anyone can view creatures)
 *   - Create / Update / Delete: authenticated CMS users only
 *
 * Hooks:
 *   - `algoliaAfterChange` / `algoliaAfterDelete`: Keeps search index current
 *   - `invalidateCreatureCache`: Purges the Next.js `'creatures'` cache tag so
 *     the creature list on the site updates immediately after a save or delete
 *
 * Caching note:
 *   The creature list is cached server-side with `unstable_cache` (tagged
 *   `'creatures'`). The `invalidateCreatureCache` hook ensures this cache
 *   is cleared on every admin save. See `src/payload/hooks/creatureCache.ts`.
 */

import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { algoliaAfterChange, algoliaAfterDelete } from '../hooks/algoliaSync'
import { invalidateCreatureCache } from '../hooks/creatureCache'

export const Creatures: CollectionConfig = {
  slug: 'creatures',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [algoliaAfterChange, invalidateCreatureCache],
    afterDelete: [algoliaAfterDelete, invalidateCreatureCache],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Short Description',
      admin: {
        description: '1-2 sentences shown in the roller.',
      },
    },
    {
      name: 'mainImage',
      type: 'upload',
      relationTo: 'media',
    },
    // ─── Core Scores ──────────────────────────────────────────────────────────
    // These four scores match the player character score system.
    // They default to 10, which is the baseline in the Atom Magic game system.
    {
      name: 'physical',
      type: 'number',
      defaultValue: 10,
    },
    {
      name: 'interpersonal',
      type: 'number',
      defaultValue: 10,
    },
    {
      name: 'intellect',
      type: 'number',
      defaultValue: 10,
    },
    {
      name: 'psyche',
      type: 'number',
      defaultValue: 10,
    },
    // ─── Combat Stats ─────────────────────────────────────────────────────────
    {
      name: 'health',
      type: 'number',
    },
    {
      name: 'physicalShield',
      type: 'number',
    },
    {
      name: 'psychicShield',
      type: 'number',
    },
    {
      name: 'armorCapacity',
      type: 'number',
    },
    // ─── Attacks ──────────────────────────────────────────────────────────────
    {
      name: 'attacks',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { description: 'e.g., "Claw", "Bite"' },
        },
        {
          name: 'damage',
          type: 'text',
          admin: { description: 'e.g., "2d6 + 3"' },
        },
      ],
    },
    // ─── Special Abilities ────────────────────────────────────────────────────
    {
      name: 'specialAbilities',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },
    // ─── Classification Tags ──────────────────────────────────────────────────
    {
      name: 'challengeLevel',
      type: 'select',
      defaultValue: 'moderate',
      options: [
        { label: 'Harmless', value: 'harmless' },
        { label: 'Trivial', value: 'trivial' },
        { label: 'Easy', value: 'easy' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'Hard', value: 'hard' },
        { label: 'Deadly', value: 'deadly' },
      ],
    },
    {
      name: 'creatureType',
      type: 'text',
      admin: { description: 'e.g., Beast, Construct, Humanoid' },
    },
    {
      // Stored as an array of objects rather than an array of strings because
      // Payload's array field type requires each item to have at least one named field.
      // When reading creatures in code, normalizeCreature() flattens this to string[].
      name: 'environments',
      type: 'array',
      fields: [
        {
          name: 'environment',
          type: 'text',
        },
      ],
    },
    {
      name: 'isSwarm',
      type: 'checkbox',
      defaultValue: false,
      label: 'Swarm Creature',
    },
    {
      name: 'isUnique',
      type: 'checkbox',
      defaultValue: false,
      label: 'Unique Creature',
    },
    // ─── Codex Article ────────────────────────────────────────────────────────
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      name: 'toc',
      type: 'richText',
      label: 'Table of Contents',
      editor: lexicalEditor(),
    },
    {
      name: 'entryBody',
      type: 'richText',
      label: 'Entry Body',
      editor: lexicalEditor(),
    },
  ],
}
