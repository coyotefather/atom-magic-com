import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Paths: CollectionConfig = {
  slug: 'paths',
  admin: {
    useAsTitle: 'title',
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
      label: 'Latin Name',
    },
    {
      name: 'slug',
      type: 'text',
    },
    {
      name: 'mainImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'modifiers',
      type: 'array',
      label: 'Score Modifiers',
      fields: [
        {
          name: 'modifierSubscore',
          type: 'relationship',
          relationTo: 'subscores',
          label: 'Subscore',
          required: true,
        },
        {
          name: 'modifierValue',
          type: 'number',
          label: 'Value',
          admin: {
            description: 'Positive or negative integer.',
          },
        },
      ],
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Short Description',
      editor: lexicalEditor(),
    },
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
