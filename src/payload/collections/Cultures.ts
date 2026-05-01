/**
 * Cultures.ts
 *
 * Payload CMS collection config for Cultures — the playable species and
 * cultural backgrounds that players choose during character creation.
 *
 * What a Culture is:
 *   In Atom Magic, culture represents a character's species and social origin.
 *   Playable cultures include Spiranos (humans), Boreanos, Autogena, and Umbra.
 *   (Feranos are intentionally excluded — they guard the Terrae Mortuae and are
 *   meant to remain mysterious and non-player-facing.)
 *
 *   Each culture has "aspects" — distinct sub-groups or traditions within the
 *   culture (e.g., regional variants or social castes). Players pick their
 *   culture and then select an aspect that shapes their character's background.
 *
 * Fields:
 *   - `title`       — Culture name (e.g., "Spiranos", "Boreanos")
 *   - `entry`       — Relationship to the culture's Codex entry for full lore
 *   - `mainImage`   — Optional hero image (stored in Vercel Blob via Media)
 *   - `aspects`     — Array of culture aspects (sub-groups/traditions within the culture):
 *       - `aspectName`         — Display name of the aspect
 *       - `aspectId`           — Stable string ID used in saved characters (no spaces,
 *                                do NOT change after creation — saved characters reference this)
 *       - `aspectContentSlug`  — Slug of the associated Codex entry for this aspect
 *       - `aspectDescription`  — Rich text description of the aspect
 *   - `description` — Rich text overview of the culture (shown in the Character Manager)
 *
 * Important — stable IDs:
 *   `aspectId` is stored in saved characters (in localStorage). If this ID changes
 *   after characters have been saved with it, those characters will lose their aspect
 *   selection. Treat aspectId as immutable once published.
 *
 * Access control:
 *   - Read: public
 *   - Create / Update / Delete: authenticated CMS users only
 *
 * No Algolia hooks:
 *   Cultures are not indexed in Algolia search — they are only accessed via the
 *   Character Manager, not through the Codex search interface.
 */

import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Cultures: CollectionConfig = {
  slug: 'cultures',
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
      // Sub-groups or traditions within this culture.
      // Players choose an aspect as part of their cultural background.
      name: 'aspects',
      type: 'array',
      label: 'Culture Aspects',
      fields: [
        {
          name: 'aspectName',
          type: 'text',
          label: 'Name',
        },
        {
          // IMPORTANT: this ID is stored in saved characters. Do not change after publication.
          name: 'aspectId',
          type: 'text',
          label: 'ID',
          admin: {
            description: 'Stable ID used in saved characters. No spaces.',
          },
        },
        {
          name: 'aspectContentSlug',
          type: 'text',
          label: 'Content Slug',
          admin: {
            description: 'Slug of the associated codex entry.',
          },
        },
        {
          name: 'aspectDescription',
          type: 'richText',
          label: 'Description',
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
