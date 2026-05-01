/**
 * Timeline.ts
 *
 * Payload CMS collection config for Timeline — historical events in the
 * Atom Magic world, displayed on the interactive world timeline page.
 *
 * What a Timeline event is:
 *   The timeline page (`/timeline`) shows a chronological history of the
 *   Atom Magic world, from ancient prehistory to the present day. Events
 *   are measured in years relative to the "conflagratum magnum" — the great
 *   atomic catastrophe that marks year 0 in the world's calendar. Negative
 *   years are before the conflagratum; positive years are after.
 *
 *   Events can be "major" (shown prominently on the timeline with a larger
 *   display) or regular (shown in a smaller format).
 *
 * Fields:
 *   - `title`       — Event name (e.g., "Founding of the Spirano Republic")
 *   - `year`        — Numeric year, positive or negative (required).
 *                     0 = conflagratum magnum. Events are sorted by this field.
 *   - `major`       — Whether this is a major historical event (larger display on timeline)
 *   - `icon`        — Visual icon category for the timeline marker (select from preset list).
 *                     Maps to an icon rendered in the timeline UI component.
 *   - `description` — Plain-text short description of the event
 *   - `url`         — Optional link to a Codex entry for the full event article
 *
 * Admin configuration:
 *   `defaultColumns` includes `year` and `major` so the admin list view
 *   immediately shows the most useful data without clicking into each event.
 *
 * Access control:
 *   - Read: public
 *   - Create / Update / Delete: authenticated CMS users only
 *
 * No Algolia hooks:
 *   Timeline events are not indexed in Algolia search.
 */

import type { CollectionConfig } from 'payload'

export const Timeline: CollectionConfig = {
  slug: 'timeline',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'year', 'major'],
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
      // Year relative to the conflagratum magnum (the great atomic catastrophe).
      // Negative = before the conflagratum; positive = after.
      name: 'year',
      type: 'number',
      required: true,
      admin: {
        description: 'Positive or negative. Measured relative to the conflagratum magnum.',
      },
    },
    {
      name: 'major',
      type: 'checkbox',
      label: 'Major Event',
      defaultValue: false,
    },
    {
      // Visual category for the timeline marker icon.
      // Each value maps to an SVG/MDI icon rendered in the timeline UI.
      name: 'icon',
      type: 'select',
      options: [
        { label: 'Person', value: 'person' },
        { label: 'People', value: 'people' },
        { label: 'Map', value: 'map' },
        { label: 'Waves', value: 'waves' },
        { label: 'Mountain', value: 'mountain' },
        { label: 'Swords', value: 'swords' },
        { label: 'Shield', value: 'shield' },
        { label: 'Tree', value: 'tree' },
        { label: 'Bird', value: 'bird' },
        { label: 'Wolf', value: 'wolf' },
        { label: 'Snake', value: 'snake' },
        { label: 'Fire', value: 'fire' },
        { label: 'Poison', value: 'poison' },
        { label: 'Hammer', value: 'hammer' },
        { label: 'Atom', value: 'atom' },
        { label: 'Nuke', value: 'nuke' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'url',
      type: 'text',
      label: 'Entry URL',
      admin: {
        description: 'Full link to a Codex entry.',
      },
    },
  ],
}
