import { DocumentTextIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const techniqueType = defineType({
	name: 'technique',
	title: 'Technique',
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
			name: 'cooldown',
			title: 'Cooldown',
			type: 'number',
			group: 'basic',
			description: 'The number of rounds before the technique can be used again.',
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
			description: 'The Codex category this technique belongs to',
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
