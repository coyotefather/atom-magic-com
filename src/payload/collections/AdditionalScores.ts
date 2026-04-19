import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const AdditionalScores: CollectionConfig = {
  slug: 'additional-scores',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'entry',
      type: 'relationship',
      relationTo: 'entries',
      label: 'Codex Entry',
    },
    {
      name: 'scores',
      type: 'relationship',
      relationTo: ['scores', 'subscores'],
      hasMany: true,
      label: 'Scores or Subscores',
    },
    {
      name: 'calculation',
      type: 'select',
      required: true,
      options: [
        { label: 'Sum', value: 'sum' },
        { label: 'Difference', value: 'difference' },
        { label: 'Multiple', value: 'multiply' },
        { label: 'Divide', value: 'divide' },
      ],
    },
    {
      name: 'additionalCalculations',
      type: 'array',
      fields: [
        {
          name: 'calculationType',
          type: 'select',
          options: [
            { label: 'Sum', value: 'sum' },
            { label: 'Difference', value: 'difference' },
            { label: 'Multiple', value: 'multiply' },
            { label: 'Divide', value: 'divide' },
          ],
        },
        {
          name: 'value',
          type: 'number',
        },
      ],
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor(),
    },
  ],
}
