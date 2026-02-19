import Link from 'next/link';
import Icon from '@mdi/react';
import { mdiDice6, mdiBookOpenPageVariant, mdiDiceMultiple, mdiTreasureChest, mdiAccountCog, mdiArrowRight, mdiSwordCross, mdiBookOpenPageVariantOutline, mdiTools, mdiPaw, mdiMapMarkerMultiple } from '@mdi/js';
import PageHero from '@/app/components/common/PageHero';

export const metadata = {
	title: 'Tools | Atom Magic',
	description: 'Utility tools for your Atom Magic tabletop sessions. Dice roller, creature roller, quick reference, and more.',
};

const tools = [
	{
		name: 'Character Generator',
		description: 'Quickly generate NPCs or starting characters. Choose an archetype or lock specific choices and randomize the rest.',
		href: '/generator',
		icon: mdiAccountCog,
		color: 'oxblood',
	},
	{
		name: 'Dice Roller',
		description: 'Roll dice for your sessions with support for all standard dice types, modifiers, and roll history.',
		href: '/dice',
		icon: mdiDice6,
		color: 'gold',
	},
	{
		name: 'Creature Roller',
		description: 'Browse and filter creatures by type, challenge level, and environment. Perfect for encounter planning.',
		href: '/creatures',
		icon: mdiDiceMultiple,
		color: 'laurel',
	},
	{
		name: 'Encounter Builder',
		description: 'Build and balance encounters. Select creatures, adjust quantities, and calculate threat levels for your party.',
		href: '/encounters',
		icon: mdiSwordCross,
		color: 'oxblood',
	},
	{
		name: 'Creature Manager',
		description: 'Create and customize your own creatures. Build custom monsters and NPCs, or start from an existing Codex creature.',
		href: '/creatures/manager',
		icon: mdiPaw,
		color: 'bronze',
	},
	{
		name: 'Adventure Log',
		description: 'Track rolls, character actions, and story events during sessions. Export key moments for recaps.',
		href: '/adventure-log',
		icon: mdiBookOpenPageVariantOutline,
		color: 'laurel',
	},
	{
		name: 'Campaign Dashboard',
		description: 'Link adventure log sessions into a campaign, track your party roster, and review key events across sessions.',
		href: '/campaign',
		icon: mdiMapMarkerMultiple,
		color: 'laurel',
	},
	{
		name: 'Loot Roller',
		description: 'Generate random treasure for your sessions. Roll for weapons, armor, coins, and miscellaneous items.',
		href: '/loot',
		icon: mdiTreasureChest,
		color: 'bronze',
	},
	{
		name: 'Quick Reference',
		description: 'Essential rules at a glance. Combat flow, damage types, conditions, and commonly-needed mechanics.',
		href: '/quick-reference',
		icon: mdiBookOpenPageVariant,
		color: 'stone',
	},
];

const colorClasses: Record<string, { bg: string; border: string; icon: string }> = {
	gold: {
		bg: 'bg-gold/10',
		border: 'border-gold',
		icon: 'text-gold',
	},
	oxblood: {
		bg: 'bg-oxblood/10',
		border: 'border-oxblood',
		icon: 'text-oxblood',
	},
	laurel: {
		bg: 'bg-laurel/10',
		border: 'border-laurel',
		icon: 'text-laurel',
	},
	bronze: {
		bg: 'bg-bronze/10',
		border: 'border-bronze',
		icon: 'text-bronze',
	},
	stone: {
		bg: 'bg-stone/10',
		border: 'border-stone',
		icon: 'text-stone',
	},
};

export default function ToolsPage() {
	return (
		<main className="notoserif min-h-screen bg-parchment">
			<PageHero
				title="Tools"
				description="Utility tools for your Atom Magic tabletop sessions"
				icon={mdiTools}
				accentColor="gold"
				variant="inline"
			/>

			<div className="container px-6 md:px-8 py-8 md:py-12">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{tools.map((tool) => {
						const colors = colorClasses[tool.color];
						return (
							<Link
								key={tool.href}
								href={tool.href}
								className="group block bg-white border-2 border-stone hover:border-gold transition-colors no-underline"
							>
								<div className={`p-6 ${colors.bg} border-b-2 ${colors.border}`}>
									<div className="flex items-center gap-4">
										<div className={`w-12 h-12 flex items-center justify-center border-2 ${colors.border} bg-white`}>
											<Icon path={tool.icon} size={1.25} className={colors.icon} />
										</div>
										<h2 className="marcellus text-xl text-black group-hover:text-gold transition-colors">
											{tool.name}
										</h2>
									</div>
								</div>
								<div className="p-6">
									<p className="text-stone text-sm mb-4">
										{tool.description}
									</p>
									<span className="inline-flex items-center gap-1 text-sm text-bronze group-hover:text-gold transition-colors marcellus uppercase tracking-wider">
										Open tool
										<Icon path={mdiArrowRight} size={0.625} />
									</span>
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</main>
	);
}
