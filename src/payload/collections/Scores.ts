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
