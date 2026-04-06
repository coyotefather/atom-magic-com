import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Cultures: CollectionConfig = {
  slug: 'cultures',
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
