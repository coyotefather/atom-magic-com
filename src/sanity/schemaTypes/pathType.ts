import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const pathType = defineType({
  name: 'path',
  title: 'Path',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      validation: rule => rule.required(),
      type: 'string',
    }),
    defineField({
      name: 'latin',
      description: 'Title in Latin',
      validation: rule => rule.required(),
      type: 'string',
    }),
    defineField({
      name: 'entry',
      type: 'reference',
      description: 'Optional reference to a codex entry.',
      to: {type: 'entry'},
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
      name: 'modifiers',
      title: 'Modifiers',
      description: '',
      type: 'array',
      of: [
        {name: 'modifier', title: 'Modifier', type: 'object', fields: [
          {name: 'modifierName', title: 'Name',  type: 'string'},
          {name: 'modifierId', title: 'ID', description: 'Note: changing this ID will break existing saved characters. Please avoid spaces.',  type: 'string'},
          {
            name: 'modifierSubscore',
            title: 'Subscore',
            type: 'reference',
            description: 'Reference to the modified subscore.',
            validation: rule => rule.required(),
            to: {type: 'subscore'},
          },
          {name: 'modifierValue', title: 'Value', description: 'This can be a positive or negative integer.',  type: 'number'},
        ]},
      ],
    }),
    defineField({
      type: 'markdown',
      name: 'description',
      title: 'Description',
    }),
  ],
})
