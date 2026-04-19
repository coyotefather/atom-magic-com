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
