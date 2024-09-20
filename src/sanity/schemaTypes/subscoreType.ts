import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const subscoreType = defineType({
  name: 'subscore',
  title: 'Subscore',
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
      title: "Score",
      name: "score",
      description: 'Reference to parent Score.',
      type: "reference",
      to: [{ type: "score" }]
    }),
    defineField({
      name: 'defaultValue',
      title: 'Default Value',
      type: 'number',
    }),
    defineField({
      type: 'markdown',
      name: 'description',
      title: 'Description',
    }),
  ],
})
