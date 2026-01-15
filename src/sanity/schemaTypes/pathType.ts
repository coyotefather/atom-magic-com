import { DocumentTextIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const pathType = defineType({
	name: 'path',
	title: 'Path',
	type: 'document',
	icon: DocumentTextIcon,
	groups: [
		{ name: 'basic', title: 'Basic Info', default: true },
		{ name: 'codex', title: 'Codex Entry' },
	],
	fields: [
		// Basic Info
		defineField({
			name: 'title',
			title: 'Title',
			type: 'string',
			group: 'basic',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'latin',
			title: 'Latin Name',
			description: 'Title in Latin',
			type: 'string',
			group: 'basic',
		}),
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			group: 'basic',
			options: {
				source: 'title',
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'mainImage',
			title: 'Image',
			type: 'image',
			group: 'basic',
			options: {
				hotspot: true,
			},
			fields: [
				{
					name: 'alt',
					type: 'string',
					title: 'Alternative text',
				},
			],
		}),
		defineField({
			name: 'modifiers',
			title: 'Modifiers',
			description: 'Score modifiers for this path',
			type: 'array',
			group: 'basic',
			of: [
				{
					name: 'modifier',
					title: 'Modifier',
					type: 'object',
					fields: [
						{
							name: 'modifierSubscore',
							title: 'Subscore',
							type: 'reference',
							description: 'Reference to the modified subscore.',
							validation: (Rule) => Rule.required(),
							to: { type: 'subscore' },
						},
						{
							name: 'modifierValue',
							title: 'Value',
							description: 'This can be a positive or negative integer.',
							type: 'number',
						},
					],
				},
			],
		}),
		defineField({
			name: 'description',
			title: 'Short Description',
			description: 'Brief description shown in lists and cards',
			type: 'markdown',
			group: 'basic',
		}),

		// Codex Entry Fields
		defineField({
			name: 'category',
			title: 'Category',
			description: 'The Codex category this path belongs to',
			type: 'reference',
			to: [{ type: 'category' }],
			group: 'codex',
		}),
		defineField({
			name: 'toc',
			title: 'Table of Contents',
			description: 'Optional table of contents for the entry',
			type: 'markdown',
			group: 'codex',
		}),
		defineField({
			name: 'entryBody',
			title: 'Entry Body',
			description: 'Full Codex entry content in markdown',
			type: 'markdown',
			group: 'codex',
		}),
	],
	preview: {
		select: {
			title: 'title',
			subtitle: 'latin',
			media: 'mainImage',
		},
	},
});
