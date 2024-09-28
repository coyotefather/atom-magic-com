import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'


export const additionalScoresType = defineType({
  name: 'additionalScores',
  title: 'Additional Scores',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      validation: rule => rule.required(),
      type: 'string',
    }),
    defineField({
      name: 'value',
      type: 'number',
      hidden: true,
    }),
    defineField({
      name: 'entry',
      type: 'reference',
      description: 'Optional reference to a codex entry.',
      to: {type: 'entry'},
    }),
    defineField({
      name: 'scores',
      title: 'Scores or Subscores',
      description: '',
      type: 'array',
      of: [
        {
          name: 'score',
          type: 'reference',
          description: 'Reference to either a Score or Subscore.',
          to: [{type: 'score'}, {type: 'subscore'}],
        }
      ],
    }),
    defineField({
      name: 'calculation',
      validation: rule => rule.required(),
      type: 'string',
      description: 'This arithmetic choice is applied collectively to all scores, i.e. "Sum" will add them all together, "Multiply" will multiple them all by each other. The order of operations follows the order of scores above.',
      options: {
        list: [
          {title: 'Sum', value: 'sum'},
          {title: 'Difference', value: 'difference'},
          {title: 'Multiple', value: 'multiply'},
          {title: 'Divide', value: 'divide'},
        ]
      }
    }),
    defineField({
      name: 'additionalCalculations',
      type: 'array',
      description: 'This additional arithmetic choice applied to the result of the previous calculation. The order of operations follows the order of all additional calculations.',
      of: [
        {
          name: 'additionalCalculation',
          title: 'Additional Calculation',
          type: 'object',
          fields: [
            {
              name: 'calculationType',
              type: 'string',
              options: {
                list: [
                  {title: 'Sum', value: 'sum'},
                  {title: 'Difference', value: 'difference'},
                  {title: 'Multiple', value: 'multiply'},
                  {title: 'Divide', value: 'divide'},
                ]
              }
            },
            {
              name: 'value',
              type: 'number'
            }
          ]
        }
      ]
    }),
    defineField({
      type: 'markdown',
      name: 'description',
      title: 'Description',
    }),
  ],
  initialValue: {
    value: 0
  }
})
