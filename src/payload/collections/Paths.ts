/**
 * Paths.ts
 *
 * Payload CMS collection config for Paths — the character archetypes that
 * players choose during character creation.
 *
 * What a Path is:
 *   A Path represents how a character learned their atomic magic. There are
 *   three Paths:
 *     - Theurgist (Doctrina Academia) — Academy-trained mages, learned in theory
 *     - Iconoclast (Discipulīna Audax) — Heretical practitioners, self-styled rebels
 *     - Autodidact (Erudītio Sui) — Self-taught wild talents
 *
 *   The Path a player chooses determines which Disciplines are available to them
 *   (via the `paths` field on each Discipline) and grants initial score modifiers
 *   that adjust the character's subscores at creation time.
 *
 * Fields:
 *   - `title`       — Path name (e.g., "Theurgist")
 *   - `latin`       — Latin name (e.g., "Doctrina Academia") — shown in the UI for flavor
 *   - `slug`        — URL-safe identifier for the Path's Codex page
 *   - `mainImage`   — Optional hero image (stored in Vercel Blob via Media)
 *   - `modifiers`   — Array of score modifiers applied when this path is chosen.
 *                     Each modifier specifies a Subscore (e.g., "Agility") and a numeric
 *                     value (positive or negative). The Character Manager applies these
 *                     automatically when the player selects their path.
 *   - `description` — Short rich text description shown in the Character Manager selector
 *   - `category`    — Codex category
 *   - `toc`         — Rich text table of contents for the Codex article
 *   - `entryBody`   — Full Codex article body as Lexical rich text
 *
 * Modifier system:
 *   Each modifier in the `modifiers` array is:
 *     { modifierSubscore: Subscore, modifierValue: number }
 *   The `modifierSubscore` is a relationship to a specific subscore (e.g., the
 *   "Strength" subscore under "Physical"). `modifierValue` is the adjustment
 *   (e.g., +2 or -1). These are read by `fetchCharacterData()` at depth 2 and
 *   applied by the `setPath` reducer in characterSlice.
 *
 * Access control:
 *   - Read: public
 *   - Create / Update / Delete: authenticated CMS users only
 *
 * Hooks:
 *   - `afterChange` / `afterDelete`: Syncs to Algolia search index
 */

import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { algoliaAfterChange, algoliaAfterDelete } from '../hooks/algoliaSync'

export const Paths: CollectionConfig = {
  slug: 'paths',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [algoliaAfterChange],
    afterDelete: [algoliaAfterDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'latin',
      type: 'text',
      label: 'Latin Name',
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
    },
    {
      name: 'mainImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      // Score modifiers applied to the character when this path is selected.
      // Each modifier references a specific subscore and provides an adjustment value.
      name: 'modifiers',
      type: 'array',
      label: 'Score Modifiers',
      fields: [
        {
          name: 'modifierSubscore',
          type: 'relationship',
          relationTo: 'subscores',
          label: 'Subscore',
          required: true,
        },
        {
          name: 'modifierValue',
          type: 'number',
          label: 'Value',
          admin: {
            description: 'Positive or negative integer.',
          },
        },
      ],
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Short Description',
      editor: lexicalEditor(),
    },
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
