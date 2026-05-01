/**
 * Patronages.ts
 *
 * Payload CMS collection config for Patronages — the patron deities and
 * Cardinals that characters can choose to align with during character creation.
 *
 * What a Patronage is:
 *   In Atom Magic, characters can choose a patron — a powerful Cardinal or
 *   deity-like entity. The patron provides the character with specific
 *   supernatural effects or boons that influence play. The thirteen Cardinals
 *   are named entities in the Atom Magic world (Anathema, Aura, Arcadia,
 *   Cadence, Charlatan, Gamma, Magna, Mnemonic, Polyphony, Rubicon, Sovereign,
 *   Spectrum, Vertigo).
 *
 * Fields:
 *   - `title`       — English name (e.g., "Gamma")
 *   - `titleLatin`  — Latin name (for flavor/flavor text in the UI)
 *   - `epithet`     — Short descriptive title (e.g., "The Radiant")
 *   - `epithetLatin` — Latin version of the epithet
 *   - `entry`       — Relationship to the Cardinal's Codex entry (full lore)
 *   - `mainImage`   — Optional image (stored in Vercel Blob via Media)
 *   - `effects`     — Array of patronage effects (the actual game boons):
 *       - `title`       — Effect name
 *       - `titleLatin`  — Latin version
 *       - `entry`       — Relationship to the Codex entry for this specific effect
 *       - `description` — Rich text description of what the effect does in play
 *   - `description` — Rich text overview of the patron (shown in Character Manager)
 *
 * Access control:
 *   - Read: public
 *   - Create / Update / Delete: authenticated CMS users only
 *
 * No Algolia hooks:
 *   Patronages are not in the Algolia search index (they are accessed only through
 *   the Character Manager, not via Codex search).
 */

import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Patronages: CollectionConfig = {
  slug: 'patronages',
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
      name: 'titleLatin',
      type: 'text',
      label: 'Title in Latin',
    },
    {
      name: 'epithet',
      type: 'text',
    },
    {
      name: 'epithetLatin',
      type: 'text',
      label: 'Epithet in Latin',
    },
    {
      name: 'entry',
      type: 'relationship',
      relationTo: 'entries',
      label: 'Codex Entry',
    },
    {
      name: 'mainImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      // The supernatural boons granted by this patron.
      // Each effect is a distinct benefit the character gains during play.
      name: 'effects',
      type: 'array',
      label: 'Patronage Effects',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'titleLatin',
          type: 'text',
          label: 'Title in Latin',
        },
        {
          // Optional link to the Codex entry that describes this effect in full
          name: 'entry',
          type: 'relationship',
          relationTo: 'entries',
          label: 'Codex Entry',
        },
        {
          name: 'description',
          type: 'richText',
          editor: lexicalEditor(),
        },
      ],
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor(),
    },
  ],
}
