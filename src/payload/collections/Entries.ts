import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { algoliaAfterChange, algoliaAfterDelete } from '../hooks/algoliaSync'

export const Entries: CollectionConfig = {
  slug: 'entries',
  admin: {
    useAsTitle: 'title',
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
      name: 'title',
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
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'mainImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'cardDetails',
      type: 'array',
      label: 'Card Details',
      fields: [
        {
          name: 'detailName',
          type: 'text',
          label: 'Name',
        },
        {
          name: 'detailDescription',
          type: 'textarea',
          label: 'Description',
        },
      ],
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
