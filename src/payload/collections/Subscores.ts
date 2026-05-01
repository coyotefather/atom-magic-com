/**
 * Subscores.ts
 *
 * Payload CMS collection config for Subscores — the individual attributes
 * that make up each of the four core Scores.
 *
 * What a Subscore is:
 *   Each core Score (Physical, Interpersonal, Intellect, Psyche) is composed
 *   of several sub-attributes called Subscores. For example, "Physical" might
 *   have subscores like Strength, Agility, and Endurance. The player sets each
 *   subscore value individually in the Character Manager's "Adjust Scores" section.
 *   The parent Score's value is then computed as the average of its subscores
 *   (see `src/lib/utils/score.ts`).
 *
 *   Subscores are also referenced by:
 *   - Path modifiers: each Path can grant a +/- adjustment to a specific subscore
 *   - AdditionalScores formulas: derived stats (like Physical Shield) can be
 *     calculated from specific subscores
 *
 * Fields:
 *   - `title`        — Subscore name (e.g., "Strength", "Agility")
 *   - `subscoreId`   — Stable string identifier stored in saved character data.
 *                      IMPORTANT: Do not change after characters have been saved with it.
 *                      Saved characters store subscore values keyed by this ID.
 *   - `score`        — Relationship to the parent Score (e.g., Strength → Physical).
 *                      This is how the parent-child relationship is stored — the subscore
 *                      references its parent, not the other way around.
 *   - `defaultValue` — The default numeric value for this subscore at character creation.
 *                      New characters start with this value before any path modifiers are applied.
 *   - `description`  — Rich text description of what this subscore represents in play
 *
 * Access control:
 *   - Read: public
 *   - Create / Update / Delete: authenticated CMS users only
 *
 * No Algolia hooks:
 *   Subscores are internal game data used only in the Character Manager.
 */

import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Subscores: CollectionConfig = {
  slug: 'subscores',
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
      // Stable identifier stored in saved characters. Do not change after creation.
      name: 'subscoreId',
      type: 'text',
      label: 'ID',
      admin: {
        description: 'Stable identifier used in saved characters. Do not change after creation.',
      },
    },
    {
      // Which of the four core Scores this subscore belongs to.
      // Used by fetchCharacterData() to group subscores under their parent score.
      name: 'score',
      type: 'relationship',
      relationTo: 'scores',
      label: 'Parent Score',
    },
    {
      name: 'defaultValue',
      type: 'number',
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor(),
    },
  ],
}
