import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const timelineType = defineType({
  name: 'timeline',
  title: 'Timeline',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'URL',
      type: 'url',
      title: 'Entry URL',
      description: 'A full link to an entry in the Codex.',
    }),
    defineField({
      title: 'Icon',
      name: 'icon',
      type: 'string',
      description: 'Choose an icon for the timeline event. This icon is only shown for major events.',
      options: {
        list: [
          {title: 'Person Icon', value: 'person'},
          {title: 'People Icon', value: 'people'},
          {title: 'Map Icon', value: 'map'},
          {title: 'Waves Icon', value: 'waves'},
          {title: 'Mountain Icon', value: 'mountain'},
          {title: 'Swords Icon', value: 'swords'},
          {title: 'Shield Icon', value: 'shield'},
          {title: 'Tree Icon', value: 'tree'},
          {title: 'Bird Icon', value: 'bird'},
          {title: 'Wolf Icon', value: 'wolf'},
          {title: 'Snake Icon', value: 'snake'},
          {title: 'Fire Icon', value: 'fire'},
          {title: 'Poison Icon', value: 'poison'},
          {title: 'Hammer Icon', value: 'hammer'},
          {title: 'Atom Icon', value: 'atom'},
          {title: 'Nuke Icon', value: 'nuke'},
        ],
      }
    }),
    defineField({
      name: 'description',
      type: 'text',
    }),
    defineField({
      name: 'major',
      type: 'boolean',
      title: 'Was this a major event?',
    }),
    defineField({
      name: 'year',
      type: 'number',
      title: 'Year',
      description: 'A positive or negative number indicating the year before or after the conflagratum magnum.',
    }),
  ],
})
