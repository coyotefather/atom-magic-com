import { defineField, defineType } from 'sanity';
import { BoltIcon } from '@sanity/icons';

export const creatureType = defineType({
	name: 'creature',
	title: 'Creature',
	type: 'document',
	icon: BoltIcon,
	groups: [
		{ name: 'basic', title: 'Basic Info', default: true },
		{ name: 'scores', title: 'Scores' },
		{ name: 'combat', title: 'Combat' },
		{ name: 'tags', title: 'Tags & Filters' },
		{ name: 'codex', title: 'Codex Entry' },
	],
	fields: [
		// Basic Info
		defineField({
			name: 'name',
			title: 'Name',
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
				source: 'name',
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'description',
			title: 'Short Description',
			description: 'Brief description shown in the roller (1-2 sentences)',
			type: 'text',
			rows: 3,
			group: 'basic',
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
		// Codex Entry Fields
		defineField({
			name: 'category',
			title: 'Category',
			description: 'The Codex category this creature belongs to',
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

		// Basic Scores
		defineField({
			name: 'physical',
			title: 'Physical',
			type: 'number',
			group: 'scores',
			initialValue: 10,
			validation: (Rule) => Rule.min(1).max(100),
		}),
		defineField({
			name: 'interpersonal',
			title: 'Interpersonal',
			type: 'number',
			group: 'scores',
			initialValue: 10,
			validation: (Rule) => Rule.min(1).max(100),
		}),
		defineField({
			name: 'intellect',
			title: 'Intellect',
			type: 'number',
			group: 'scores',
			initialValue: 10,
			validation: (Rule) => Rule.min(1).max(100),
		}),
		defineField({
			name: 'psyche',
			title: 'Psyche',
			type: 'number',
			group: 'scores',
			initialValue: 10,
			validation: (Rule) => Rule.min(1).max(100),
		}),

		// Combat Stats
		defineField({
			name: 'health',
			title: 'Health',
			description: 'Total health points',
			type: 'number',
			group: 'combat',
		}),
		defineField({
			name: 'physicalShield',
			title: 'Physical Shield',
			type: 'number',
			group: 'combat',
		}),
		defineField({
			name: 'psychicShield',
			title: 'Psychic Shield',
			type: 'number',
			group: 'combat',
		}),
		defineField({
			name: 'armorCapacity',
			title: 'Armor Capacity',
			type: 'number',
			group: 'combat',
		}),
		defineField({
			name: 'damage',
			title: 'Damage',
			description: 'e.g., "2d6 + 3" or "1d8"',
			type: 'string',
			group: 'combat',
		}),
		defineField({
			name: 'specialAbilities',
			title: 'Special Abilities',
			type: 'array',
			group: 'combat',
			of: [
				{
					name: 'ability',
					title: 'Ability',
					type: 'object',
					fields: [
						{
							name: 'name',
							title: 'Name',
							type: 'string',
							validation: (Rule) => Rule.required(),
						},
						{
							name: 'description',
							title: 'Description',
							type: 'text',
							rows: 2,
						},
					],
					preview: {
						select: {
							title: 'name',
							subtitle: 'description',
						},
					},
				},
			],
		}),

		// Tags & Filters
		defineField({
			name: 'challengeLevel',
			title: 'Challenge Level',
			type: 'string',
			group: 'tags',
			options: {
				list: [
					{ title: 'Trivial', value: 'trivial' },
					{ title: 'Easy', value: 'easy' },
					{ title: 'Moderate', value: 'moderate' },
					{ title: 'Hard', value: 'hard' },
					{ title: 'Deadly', value: 'deadly' },
				],
				layout: 'radio',
			},
			initialValue: 'moderate',
		}),
		defineField({
			name: 'creatureType',
			title: 'Creature Type',
			description: 'e.g., Beast, Construct, Humanoid, Aberration',
			type: 'string',
			group: 'tags',
		}),
		defineField({
			name: 'environments',
			title: 'Environments',
			description: 'Where this creature is typically found',
			type: 'array',
			group: 'tags',
			of: [{ type: 'string' }],
			options: {
				layout: 'tags',
			},
		}),
		defineField({
			name: 'isSwarm',
			title: 'Swarm Creature',
			description: 'Check if this creature typically appears in groups',
			type: 'boolean',
			group: 'tags',
			initialValue: false,
		}),
		defineField({
			name: 'isUnique',
			title: 'Unique Creature',
			description: 'Check if this is a unique/named creature (boss, etc.)',
			type: 'boolean',
			group: 'tags',
			initialValue: false,
		}),
	],
	preview: {
		select: {
			title: 'name',
			subtitle: 'creatureType',
			media: 'mainImage',
			challengeLevel: 'challengeLevel',
		},
		prepare(selection) {
			const { title, subtitle, media, challengeLevel } = selection;
			return {
				title,
				subtitle: `${subtitle || 'Unknown type'} • ${challengeLevel || 'moderate'}`,
				media,
			};
		},
	},
	orderings: [
		{
			title: 'Name',
			name: 'nameAsc',
			by: [{ field: 'name', direction: 'asc' }],
		},
		{
			title: 'Challenge Level',
			name: 'challengeDesc',
			by: [{ field: 'challengeLevel', direction: 'desc' }],
		},
	],
});
