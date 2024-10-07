import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const techniqueType = defineType({
  name: 'technique',
  title: 'Technique',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'entry',
      type: 'reference',
      description: 'Optional reference to a codex entry.',
      to: {type: 'entry'},
    }),
    defineField({
      name: 'cooldown',
      type: 'number',
      description: 'The number of rounds before the technique can be used again.',
    }),
    defineField({
      type: 'markdown',
      name: 'description',
      title: 'Description',
    }),
  ],
})
