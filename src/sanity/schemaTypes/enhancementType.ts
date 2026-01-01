import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const enhancementType = defineType({
  name: 'enhancement',
  title: 'Enhancement',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'latin',
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
      description: 'The number of rounds before the enhancement can be used again.',
    }),
    defineField({
      type: 'markdown',
      name: 'description',
      title: 'Description',
    }),
  ],
})
