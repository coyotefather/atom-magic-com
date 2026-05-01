/**
 * Entries.ts
 *
 * Payload CMS collection config for Codex entries — the primary lore and
 * rules articles that make up the Atom Magic Codex.
 *
 * What a Codex entry is:
 *   The Codex is the site's encyclopedia. Each entry is a standalone article
 *   covering a topic from the Atom Magic world: a culture, a place, a game
 *   mechanic, a historical event, a Cardinal, etc. Entries are linked to
 *   from other collections (patronages link to their Cardinal's entry, cultures
 *   link to their lore entry, etc.) and displayed at `/codex/[slug]`.
 *
 * Fields:
 *   - `title`       — The article's display name (shown in search, breadcrumbs, etc.)
 *   - `slug`        — URL-safe identifier used in the route `/codex/[slug]`
 *                     Must be unique across the collection. Set `index: true` for
 *                     fast lookups since every page load resolves entries by slug.
 *   - `author`      — Optional relationship to a Users document (the CMS author).
 *   - `mainImage`   — Optional hero image for the article (stored in Vercel Blob via Media).
 *   - `category`    — Relationship to a Categories document (hierarchical — categories
 *                     can have parent categories, e.g., "Cultures" under "World").
 *   - `publishedAt` — When the entry was published (optional, informational only).
 *   - `description` — Short plain-text excerpt shown in search results and card previews.
 *   - `cardDetails` — An array of name/description pairs shown on entry cards.
 *                     Used for structured data like stat blocks or key facts.
 *   - `toc`         — Rich text table of contents (Lexical editor).
 *   - `entryBody`   — The full article body as Lexical rich text.
 *
 * Access control:
 *   - Read: public (anyone can read codex entries)
 *   - Create / Update / Delete: authenticated CMS users only
 *
 * Hooks:
 *   - `afterChange` / `afterDelete`: Syncs the title, slug, and description to Algolia
 *     so the site search index stays current when entries are saved or removed.
 *
 * Rendering rich text:
 *   The `toc` and `entryBody` fields are Lexical JSON — not plain HTML. Render
 *   them with `<RichText content={doc.entryBody} />` from
 *   `src/app/components/common/RichText.tsx`.
 */

import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { algoliaAfterChange, algoliaAfterDelete } from '../hooks/algoliaSync'

export const Entries: CollectionConfig = {
  slug: 'entries',
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
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'mainImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'cardDetails',
      type: 'array',
      label: 'Card Details',
      fields: [
        {
          name: 'detailName',
          type: 'text',
          label: 'Name',
        },
        {
          name: 'detailDescription',
          type: 'textarea',
          label: 'Description',
        },
      ],
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
