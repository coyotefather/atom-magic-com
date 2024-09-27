import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const patronageType = defineType({
  name: 'patronage',
  title: 'Patronage',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'titleLatin',
      title: "Title in Latin",
      type: 'string',
    }),
    defineField({
      name: 'epithet',
      type: 'string',
    }),
    defineField({
      name: 'epithetLatin',
      title: "Epithet in Latin",
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
      name: 'effects',
      title: 'Patronage Effects',
      description: '',
      type: 'array',
      of: [
        { name: 'effect', type: 'object', fields: [
          {name: 'title', title: 'Title',  type: 'string'},
          {name: 'titleLatin', title: 'Title in Latin', type: 'string'},
          {
            name: 'entry',
            type: 'reference',
            description: 'Optional reference to a codex entry.',
            to: {type: 'entry'},
          },
          {
            title: 'Polarity',
            name: 'polarity',
            type: 'string',
            description: 'Is the effect positive or negative?',
            options: {
              list: [
                {title: 'positive', value: 'positive'},
                {title: 'negative', value: 'negative'}
              ],
            }
          },
          { name: 'levels', type: 'array', of: [
            { name: 'level', type: 'object', fields: [
              {
                title: 'Level',
                name: 'level',
                type: 'string',
                validation: rule => rule.required(),
                description: 'Is the effect positive or negative?',
                options: {
                  list: [
                    {title: 'I', value: 'I'},
                    {title: 'II', value: 'II'},
                    {title: 'III', value: 'III'}
                  ],
                }
              },
              {name: 'description', type: 'string'},
            ]},
          ]},
          { name: 'description', type: 'string'},
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
