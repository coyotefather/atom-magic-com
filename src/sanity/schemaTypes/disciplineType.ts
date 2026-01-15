import { DocumentTextIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const disciplineType = defineType({
	name: 'discipline',
	title: 'Discipline',
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
			name: 'paths',
			title: 'Paths',
			description: 'Which paths have access to this discipline',
			type: 'array',
			group: 'basic',
			of: [
				{
					title: 'Path',
					name: 'path',
					type: 'reference',
					to: [{ type: 'path' }],
				},
			],
		}),
		defineField({
			name: 'techniques',
			title: 'Techniques',
			description: 'Techniques within this discipline',
			type: 'array',
			group: 'basic',
			of: [
				{
					title: 'Technique',
					name: 'technique',
					type: 'reference',
					to: [{ type: 'technique' }],
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
			description: 'The Codex category this discipline belongs to',
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
			media: 'mainImage',
		},
	},
});
