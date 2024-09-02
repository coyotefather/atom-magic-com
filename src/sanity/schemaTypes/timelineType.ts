import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const timelineType = defineType({
  name: 'timeline',
  title: 'Timeline',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'URL',
      type: 'url',
      title: 'Entry URL',
      description: 'A full link to an entry in the Codex.',
    }),
    defineField({
      name: 'description',
      type: 'text',
    }),
    defineField({
      name: 'major',
      type: 'boolean',
      title: 'Was this a major event?',
    }),
    defineField({
      name: 'year',
      type: 'number',
      title: 'Year',
      description: 'A positive or negative number indicating the year before or after the conflagratum magnum.',
    }),
  ],
})
