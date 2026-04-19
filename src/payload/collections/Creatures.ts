import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { algoliaAfterChange, algoliaAfterDelete } from '../hooks/algoliaSync'

export const Creatures: CollectionConfig = {
  slug: 'creatures',
  admin: {
    useAsTitle: 'name',
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
      name: 'name',
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
      name: 'description',
      type: 'textarea',
      label: 'Short Description',
      admin: {
        description: '1-2 sentences shown in the roller.',
      },
    },
    {
      name: 'mainImage',
      type: 'upload',
      relationTo: 'media',
    },
    // Scores
    {
      name: 'physical',
      type: 'number',
      defaultValue: 10,
    },
    {
      name: 'interpersonal',
      type: 'number',
      defaultValue: 10,
    },
    {
      name: 'intellect',
      type: 'number',
      defaultValue: 10,
    },
    {
      name: 'psyche',
      type: 'number',
      defaultValue: 10,
    },
    // Combat
    {
      name: 'health',
      type: 'number',
    },
    {
      name: 'physicalShield',
      type: 'number',
    },
    {
      name: 'psychicShield',
      type: 'number',
    },
    {
      name: 'armorCapacity',
      type: 'number',
    },
    {
      name: 'attacks',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { description: 'e.g., "Claw", "Bite"' },
        },
        {
          name: 'damage',
          type: 'text',
          admin: { description: 'e.g., "2d6 + 3"' },
        },
      ],
    },
    {
      name: 'specialAbilities',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },
    // Tags
    {
      name: 'challengeLevel',
      type: 'select',
      defaultValue: 'moderate',
      options: [
        { label: 'Harmless', value: 'harmless' },
        { label: 'Trivial', value: 'trivial' },
        { label: 'Easy', value: 'easy' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'Hard', value: 'hard' },
        { label: 'Deadly', value: 'deadly' },
      ],
    },
    {
      name: 'creatureType',
      type: 'text',
      admin: { description: 'e.g., Beast, Construct, Humanoid' },
    },
    {
      name: 'environments',
      type: 'array',
      fields: [
        {
          name: 'environment',
          type: 'text',
        },
      ],
    },
    {
      name: 'isSwarm',
      type: 'checkbox',
      defaultValue: false,
      label: 'Swarm Creature',
    },
    {
      name: 'isUnique',
      type: 'checkbox',
      defaultValue: false,
      label: 'Unique Creature',
    },
    // Codex
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
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
