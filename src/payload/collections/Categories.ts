/**
 * Categories.ts
 *
 * Payload CMS collection config for Categories — the hierarchical taxonomy
 * used to organize Codex entries.
 *
 * What a Category is:
 *   The Codex is organized into a tree of categories. For example:
 *     - World
 *       ├── Cultures
 *       ├── History
 *       └── Regions
 *     - Gameplay
 *       ├── Disciplines
 *       ├── Techniques
 *       └── Gear
 *
 *   Categories are assigned to Entries, Creatures, Disciplines, Techniques,
 *   and Paths. The `parent` field lets categories nest to arbitrary depth —
 *   though in practice the Codex uses only one or two levels.
 *
 *   The Codex browse UI uses categories to build its navigation sidebar and
 *   to group entries in search results.
 *
 * Fields:
 *   - `title`       — Category name (e.g., "Cultures", "Gameplay")
 *   - `slug`        — URL-safe identifier used in Codex browse routes (e.g., `/codex/cultures`)
 *                     Must be unique. Indexed for fast lookups by slug.
 *   - `description` — Optional plain-text description (shown on the category browse page)
 *   - `parent`      — Optional relationship to another Category document.
 *                     A null parent means this is a top-level category.
 *                     A non-null parent means this category is nested under another.
 *
 * Cycles:
 *   Payload does not enforce acyclicity on the `parent` relationship — avoid
 *   creating circular hierarchies (A → B → A) as they will cause infinite loops
 *   in any recursive tree-traversal code.
 *
 * Access control:
 *   - Read: public
 *   - Create / Update / Delete: authenticated CMS users only
 *
 * No Algolia hooks:
 *   Categories themselves are not indexed in search — only the documents
 *   within them (Entries, Creatures, etc.) are.
 */

import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
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
      admin: {
        description: 'URL-safe identifier, e.g. "gameplay"',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      // Nesting: a null parent makes this top-level; a non-null parent nests it.
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Parent Category',
    },
  ],
}
