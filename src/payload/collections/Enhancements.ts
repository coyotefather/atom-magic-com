/**
 * Enhancements.ts
 *
 * Payload CMS collection config for Enhancements — gear modifications that
 * can be attached to armor to grant additional benefits.
 *
 * What an Enhancement is:
 *   Enhancements are magical or technological modifications applied to a piece
 *   of armor. When a player equips armor in the Character Manager, they can also
 *   attach one enhancement to it. Enhancements typically grant bonus shield values
 *   or special abilities (e.g., a Kinetic enhancement might add to Physical Shield;
 *   a Psychic enhancement might add to Psychic Shield).
 *
 *   NOTE: Enhancement stats (shield bonuses, etc.) are currently stored as local
 *   data in `src/lib/gear-data.ts`, NOT in this CMS collection. This collection
 *   stores the lore/description for the Codex — the game-mechanical values
 *   live in the local TypeScript file. The two are linked by name matching.
 *
 * Fields:
 *   - `title`    — Enhancement name (e.g., "Kinetic Weave", "Psychic Dampener")
 *   - `latin`    — Latin name for flavor text
 *   - `entry`    — Optional relationship to the enhancement's Codex lore entry
 *   - `cooldown` — Rounds before this enhancement can be activated again (if active)
 *   - `description` — Rich text description of the enhancement's lore and effect
 *
 * Access control:
 *   - Read: public
 *   - Create / Update / Delete: authenticated CMS users only
 *
 * No Algolia hooks:
 *   Enhancements are not in Algolia search — they are accessed only via the
 *   Character Manager's gear selection, not via Codex search.
 */

import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Enhancements: CollectionConfig = {
  slug: 'enhancements',
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
      name: 'latin',
      type: 'text',
    },
    {
      name: 'entry',
      type: 'relationship',
      relationTo: 'entries',
      label: 'Codex Entry',
    },
    {
      name: 'cooldown',
      type: 'number',
      admin: {
        description: 'Rounds before this enhancement can be used again.',
      },
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor(),
    },
  ],
}
