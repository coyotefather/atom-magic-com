import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const disciplineType = defineType({
  name: 'discipline',
  title: 'Discipline',
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
      name: 'paths',
      title: 'Paths',
      description: '',
      type: 'array',
      of: [
        {
          title: "Path",
          name: "path",
          type: "reference",
          to: [{ type: "path" }]
        },
      ],
    }),
    defineField({
      name: 'techniques',
      title: 'Techniques',
      description: '',
      type: 'array',
      of: [
        {
          title: "Technique",
          name: "technique",
          type: "reference",
          to: [{ type: "technique" }]
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
