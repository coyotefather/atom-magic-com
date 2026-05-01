/**
 * Scores.ts
 *
 * Payload CMS collection config for Scores — the four core attribute scores
 * in the Atom Magic character system.
 *
 * What a Score is:
 *   Every character (and creature) has four core scores that represent their
 *   fundamental capabilities:
 *     - Physical     — Strength, agility, endurance
 *     - Interpersonal — Charisma, persuasion, social awareness
 *     - Intellect    — Reasoning, knowledge, perception
 *     - Psyche       — Willpower, psychic resistance, mental fortitude
 *
 *   Each Score is made up of several Subscores (see Subscores.ts). The Score's
 *   numeric value is the average of its Subscores, calculated in `score.ts`.
 *
 *   Scores are also the basis for derived stats — Physical score is the base
 *   for Physical Shield, Psyche score is the base for Psychic Shield.
 *
 * Fields:
 *   - `title`    — Score name ("Physical", "Interpersonal", "Intellect", "Psyche")
 *   - `scoreId`  — Stable string identifier used in saved character data.
 *                  IMPORTANT: Do not change after characters have been saved with it.
 *                  This ID is stored in localStorage and used to look up scores when
 *                  loading a saved character.
 *   - `description` — Rich text description of what this score represents in the game
 *
 * Relationship to Subscores:
 *   Subscores reference their parent Score (via `subscores.score`), not the other way
 *   around. There is no `subscores` field on this collection. When `fetchCharacterData()`
 *   needs the full score+subscores structure, it joins them manually.
 *
 * Access control:
 *   - Read: public
 *   - Create / Update / Delete: authenticated CMS users only
 *
 * No Algolia hooks:
 *   Scores are internal game data accessed only via the Character Manager.
 */

import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Scores: CollectionConfig = {
  slug: 'scores',
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
      name: 'scoreId',
      type: 'text',
      label: 'ID',
      admin: {
        description: 'Stable identifier used in saved characters. Do not change after creation.',
      },
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor(),
    },
  ],
}
