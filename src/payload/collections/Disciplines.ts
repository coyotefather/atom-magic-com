/**
 * Disciplines.ts
 *
 * Payload CMS collection config for Disciplines — the magic schools that
 * players choose from during character creation.
 *
 * What a Discipline is:
 *   In Atom Magic, a Discipline is a school of atomic magic (e.g., Kinetic,
 *   Thermal, Psychic, Biological). Each player character chooses one or more
 *   Disciplines. The Discipline determines which Techniques are available to
 *   them and which character Paths can access it.
 *
 * Fields:
 *   - `title`       — The discipline's name (e.g., "Kinetic", "Luminous")
 *   - `slug`        — URL-safe identifier for the Codex page
 *   - `mainImage`   — Optional hero image (stored in Vercel Blob via Media)
 *   - `paths`       — Which character Paths can learn this discipline. A
 *                     "hasMany" relationship to Paths — multiple paths can
 *                     have access to the same discipline.
 *   - `techniques`  — The Techniques that belong to this discipline. A
 *                     "hasMany" relationship — each discipline offers several
 *                     techniques for the player to choose from.
 *   - `description` — Short rich text description shown in the Character Manager
 *                     and Codex card previews.
 *   - `category`    — Codex category for organizing in the Codex index
 *   - `toc`         — Rich text table of contents for the full Codex article
 *   - `entryBody`   — Full Codex article body as Lexical rich text
 *
 * Relationship note:
 *   The `paths` and `techniques` fields here are the "source of truth" for
 *   which disciplines are available to which paths/techniques. When the
 *   Character Manager loads, `fetchCharacterData()` reads these relationships
 *   at `depth: 2` to get the full discipline+technique+path data in one query.
 *
 * Access control:
 *   - Read: public
 *   - Create / Update / Delete: authenticated CMS users only
 *
 * Hooks:
 *   - `afterChange` / `afterDelete`: Syncs title, slug, and description to Algolia
 */

import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { algoliaAfterChange, algoliaAfterDelete } from '../hooks/algoliaSync'

export const Disciplines: CollectionConfig = {
  slug: 'disciplines',
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
      // Which character Paths can choose this discipline.
      // Multiple paths can access the same discipline.
      name: 'paths',
      type: 'relationship',
      relationTo: 'paths',
      hasMany: true,
      label: 'Available to Paths',
    },
    {
      // The techniques unlocked by this discipline.
      // Players pick from this list when selecting techniques during character creation.
      name: 'techniques',
      type: 'relationship',
      relationTo: 'techniques',
      hasMany: true,
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
