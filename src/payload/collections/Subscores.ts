import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Subscores: CollectionConfig = {
  slug: 'subscores',
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
      name: 'subscoreId',
      type: 'text',
      label: 'ID',
      admin: {
        description: 'Stable identifier used in saved characters. Do not change after creation.',
      },
    },
    {
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
