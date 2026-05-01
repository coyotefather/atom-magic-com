/**
 * AdditionalScores.ts
 *
 * Payload CMS collection config for Additional Scores — derived character
 * stats that are calculated from one or more core Scores or Subscores.
 *
 * What an Additional Score is:
 *   Beyond the four core Scores (Physical, Interpersonal, Intellect, Psyche),
 *   characters have derived stats like Physical Shield and Psychic Shield that
 *   are computed from combinations of other scores. These "Additional Scores"
 *   define what gets derived and how.
 *
 *   Examples:
 *     - Physical Shield = Physical score + gear bonuses
 *     - Psychic Shield  = Psyche score + gear bonuses
 *
 *   The formulas are stored here in the CMS and executed at runtime by the
 *   `setAdditionalScores` reducer in `characterSlice.ts`.
 *
 * Formula system:
 *   Each Additional Score has:
 *     - `scores` — a polymorphic relationship pointing to one or more Score or
 *       Subscore documents. These are the inputs to the formula.
 *     - `calculation` — the primary operation applied to the `scores` values:
 *         - `sum`        — add them all together
 *         - `difference` — subtract
 *         - `multiply`   — multiply
 *         - `divide`     — divide
 *     - `additionalCalculations` — an optional array of follow-up operations
 *       (type + flat value) applied to the result of the primary calculation.
 *       For example, after summing, add a flat +2 bonus.
 *
 *   The characterSlice reducer applies these operations in order to compute
 *   the final derived stat value.
 *
 * Fields:
 *   - `title`                  — Name of the derived stat (e.g., "Physical Shield")
 *   - `entry`                  — Optional Codex entry for this stat's rules explanation
 *   - `scores`                 — Polymorphic relationship to Scores and/or Subscores
 *                                (can mix both in one list)
 *   - `calculation`            — Primary calculation type (sum/difference/multiply/divide)
 *   - `additionalCalculations` — Array of follow-up calculations (type + flat numeric value)
 *   - `description`            — Rich text description
 *
 * Access control:
 *   - Read: public
 *   - Create / Update / Delete: authenticated CMS users only
 *
 * No Algolia hooks:
 *   Additional Scores are internal game data accessed only via the Character Manager.
 */

import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const AdditionalScores: CollectionConfig = {
  slug: 'additional-scores',
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
      // The Score or Subscore documents that are used as inputs to the formula.
      // Polymorphic — can reference either collection in the same list.
      name: 'scores',
      type: 'relationship',
      relationTo: ['scores', 'subscores'],
      hasMany: true,
      label: 'Scores or Subscores',
    },
    {
      // The primary operation applied to the selected scores/subscores.
      name: 'calculation',
      type: 'select',
      required: true,
      options: [
        { label: 'Sum', value: 'sum' },
        { label: 'Difference', value: 'difference' },
        { label: 'Multiple', value: 'multiply' },
        { label: 'Divide', value: 'divide' },
      ],
    },
    {
      // Optional follow-up operations applied to the result of the primary calculation.
      // For example: sum the scores, then add a flat +2.
      name: 'additionalCalculations',
      type: 'array',
      fields: [
        {
          name: 'calculationType',
          type: 'select',
          options: [
            { label: 'Sum', value: 'sum' },
            { label: 'Difference', value: 'difference' },
            { label: 'Multiple', value: 'multiply' },
            { label: 'Divide', value: 'divide' },
          ],
        },
        {
          name: 'value',
          type: 'number',
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
