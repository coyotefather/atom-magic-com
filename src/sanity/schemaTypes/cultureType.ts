import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const cultureType = defineType({
  name: 'culture',
  title: 'Culture',
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
      name: 'aspects',
      title: 'Culture Aspects',
      description: '',
      type: 'array',
      of: [
        {name: 'aspect', title: 'Aspect', type: 'object', fields: [
          {name: 'aspectName', title: 'Name',  type: 'string'},
          {name: 'aspectId', title: 'ID', description: 'Note: changing this ID will break existing saved characters. Please avoid spaces.',  type: 'string'},
          {name: 'aspectContentSlug', title: 'Content slug', description: 'This should be the slug of a codex entry.',  type: 'string'},
          {name: 'aspectDescription', title: 'Description', type: 'text'}
        ]},
      ],
    }),
    defineField({
      type: 'markdown',
      name: 'description',
      title: 'Description',
      description: 'Optionally enter a table of contents for the entry.'
    }),
  ],
})
