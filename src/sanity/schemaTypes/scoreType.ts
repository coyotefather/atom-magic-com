import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const scoreType = defineType({
  name: 'score',
  title: 'Score',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'id',
      title: 'ID',
      description: 'Note: changing this ID could break existing saved characters. Please avoid spaces.',
      type: 'string',
    }),
    defineField({
      name: 'subscores',
      title: 'Subscores',
      description: '',
      type: 'array',
      of: [
        {
          title: "Subscore",
          name: "subscore",
          type: "reference",
          to: [{ type: "subscore" }]
        },
      ],
    }),
    defineField({
      type: 'markdown',
      name: 'description',
      title: 'Description',
    }),
  ],
})
