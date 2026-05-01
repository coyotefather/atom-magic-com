/**
 * Techniques.ts
 *
 * Payload CMS collection config for Techniques — the individual atomic magic
 * abilities that players select when they choose a Discipline.
 *
 * What a Technique is:
 *   Techniques are the specific spells or abilities within a Discipline.
 *   For example, within the Kinetic discipline, a technique might be
 *   "Force Barrier" or "Kinetic Pulse". When a player chooses a Discipline
 *   in the Character Manager, they also pick Techniques from that discipline's
 *   list. Techniques are what the character actually uses during play.
 *
 * Fields:
 *   - `title`       — The technique's name (displayed in the Character Manager and sheet)
 *   - `latin`       — The Latin name/incantation (optional, for flavor)
 *   - `slug`        — URL-safe identifier for the technique's Codex page
 *   - `mainImage`   — Optional image (stored in Vercel Blob via Media)
 *   - `cooldown`    — How many rounds must pass before this technique can be used again.
 *                     0 or null means no cooldown (can be used every round).
 *   - `description` — Short rich text description shown in the Character Manager and cards
 *   - `category`    — Codex category for organizing in the Codex index
 *   - `toc`         — Rich text table of contents for the full Codex article
 *   - `entryBody`   — Full Codex article body as Lexical rich text
 *
 * Relationship note:
 *   Techniques are linked to their parent Discipline via the Disciplines collection
 *   (disciplines.techniques is the "source of truth"). This collection does NOT store
 *   a back-reference to its discipline — to find a technique's discipline, query
 *   the disciplines collection for `techniques: { contains: technique.id }`.
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

export const Techniques: CollectionConfig = {
  slug: 'techniques',
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
      name: 'cooldown',
      type: 'number',
      admin: {
        description: 'Rounds before this technique can be used again.',
      },
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
