import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Patronages: CollectionConfig = {
  slug: 'patronages',
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
      name: 'titleLatin',
      type: 'text',
      label: 'Title in Latin',
    },
    {
      name: 'epithet',
      type: 'text',
    },
    {
      name: 'epithetLatin',
      type: 'text',
      label: 'Epithet in Latin',
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
      name: 'effects',
      type: 'array',
      label: 'Patronage Effects',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'titleLatin',
          type: 'text',
          label: 'Title in Latin',
        },
        {
          name: 'entry',
          type: 'relationship',
          relationTo: 'entries',
          label: 'Codex Entry',
        },
        {
          name: 'description',
          type: 'richText',
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
