import {TagIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
    }),
    defineField({
      name: 'chipColor',
      title: 'Chip color',
      type: 'color',
      options: {
        colorList: [
          '#ADE4E4',
          '#bd6c48',
          '#BAB86C',
          '#8A8841',
          '#daa520',
          { r: 0, g: 179, b: 164 },
          { r: 238, g: 100, b: 58 },
          { r: 187, g: 151, b: 49 },
        ]
      }
    }),
    defineField({
      name: 'description',
      type: 'text',
    }),
    defineField({
      name: 'parent',
      type: 'reference',
      to: [{type: 'category'}],
      // This ensures we cannot select other "children"
      options: {
        filter: '!defined(parent)',
      },
    }),
  ],
})
