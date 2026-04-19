import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { algoliaAfterChange, algoliaAfterDelete } from '../hooks/algoliaSync'

export const Disciplines: CollectionConfig = {
  slug: 'disciplines',
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
      unique: true,
      index: true,
    },
    {
      name: 'mainImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'paths',
      type: 'relationship',
      relationTo: 'paths',
      hasMany: true,
      label: 'Available to Paths',
    },
    {
      name: 'techniques',
      type: 'relationship',
      relationTo: 'techniques',
      hasMany: true,
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
