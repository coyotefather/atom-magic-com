import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const entryType = defineType({
  name: 'entry',
  title: 'Entry',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
    }),
    defineField({
      name: 'author',
      type: 'reference',
      to: {type: 'author'},
    }),
    defineField({
      name: 'mainImage',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        }
      ]
    }),
    defineField({
      title: "Category",
      name: "category",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
    }),
    defineField({
      name: 'cardDetails',
      title: 'Additional Card Details',
      description: 'Add name and description pairs for additional information displayed on entry cards.',
      type: 'array',
      of: [
        {name: 'cardDetail', title: 'Detail', type: 'object', fields: [
          {name: 'detailName', title: 'Name',  type: 'text'},
          {name: 'detailDescription', title: 'Description', type: 'text'}
        ]},
      ],
    }),
    defineField({
      name: 'description',
      type: 'text',
    }),
    defineField({
      type: 'markdown',
      name: 'toc',
      title: 'Table of Contents',
      description: 'Optionally enter a table of contents for the entry.'
    }),
    defineField({
      type: 'markdown',
      name: 'entryBody',
      title: 'Entry Body',
      options: {
        imageUrl: ({imageAsset}:{imageAsset: any}) => `${imageAsset.url}?w=400&h=400`
      }
    })
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const {author} = selection
      return {...selection, subtitle: author && `by ${author}`}
    },
  },
})
