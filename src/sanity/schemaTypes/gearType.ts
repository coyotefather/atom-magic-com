import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'


export const gearType = defineType({
  name: 'gear',
  title: 'Gear',
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
      type: 'string',
    }),
    defineField({
      name: 'type',
      type: 'string',
      options: {
        list: [
          {title: 'Weapon', value: 'weapon'},
          {title: 'Armor', value: 'armor'},
          {title: 'Other', value: 'other'},
        ]
      }
    }),
    defineField({
      name: 'paths',
      type: 'array',
      description: 'Paths which can use this piece of gear.',
      of: [
        {
          name: 'path',
          type: 'reference',
          to: { type: 'path' }
        }
      ],
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
      name: 'damageBonus',
      description: 'Damage Bonus',
      type: 'number',
    }),
    defineField({
      name: 'shieldBonus',
      description: 'Shield Bonus',
      type: 'number',
    }),
    defineField({
      name: 'modifiers',
      title: 'Modifiers',
      description: '',
      type: 'array',
      of: [
        {name: 'modifier', title: 'Modifier', type: 'object', fields: [
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
