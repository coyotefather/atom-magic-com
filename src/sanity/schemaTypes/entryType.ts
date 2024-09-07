import {DocumentTextIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

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
      name: 'description',
      type: 'text',
    }),
    defineField({
      name: 'showOnTimeline',
      type: 'boolean',
      title: 'Show Entry on Timeline',
    }),
    defineField({
      name: 'year',
      type: 'number',
      title: 'Year',
      description: 'A positive or negative number indicating the year before or after the conflagratum magnum.',
    }),
    defineField({
      name: 'yearDescription',
      type: 'text',
      title: 'Year Details',
      description: 'Describe the event that happened during the year listed.',
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
    }),
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
