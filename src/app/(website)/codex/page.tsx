import CodexHero from '@/app/components/codex/CodexHero';
import ContentCard from '@/app/components/common/ContentCard';
import { Search } from '@/app/components/global/search/Search';
import { mdiSword, mdiBookOpenVariant, mdiCalendarClock } from '@mdi/js';

export const dynamic = 'force-dynamic';

const Page = async () => {
	const categories = [
		{
			title: 'Gameplay',
			description:
				'Rules, character creation, disciplines, techniques, and everything you need to play.',
			href: '/codex/categories/gameplay',
			icon: mdiSword,
			accentColor: 'var(--color-oxblood)',
		},
		{
			title: 'Lore',
			description:
				'The history, cultures, and mysteries of Solum and its Cardinal forces.',
			href: '/codex/categories/lore',
			icon: mdiBookOpenVariant,
			accentColor: 'var(--color-gold)',
		},
		{
			title: 'Timeline',
			description:
				'A chronological journey through the major events that shaped Solum.',
			href: '/codex/timeline',
			icon: mdiCalendarClock,
			accentColor: 'var(--color-laurel)',
		},
	];

	return (
		<main className="notoserif">
			<CodexHero />

			{/* Categories Section */}
			<section className="bg-white py-12 md:py-16">
				<div className="container px-6 md:px-8">
					<div className="text-center mb-10">
						<h2 className="marcellus text-2xl md:text-3xl text-black mb-3">
							Browse by Category
						</h2>
						<p className="text-stone-dark max-w-xl mx-auto">
							Explore the Codex through curated collections of entries.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
						{categories.map((category) => (
							<ContentCard
								key={category.title}
								title={category.title}
								description={category.description}
								href={category.href}
								icon={category.icon}
								accentColor={category.accentColor}
							/>
						))}
					</div>
				</div>
			</section>

			{/* Search Section */}
			<section className="bg-parchment py-12 md:py-16 border-t-2 border-stone">
				<div className="container px-6 md:px-8">
					<div className="text-center mb-10">
						<h2 className="marcellus text-2xl md:text-3xl text-black mb-3">
							Search the Codex
						</h2>
						<p className="text-stone-dark max-w-xl mx-auto">
							Find specific entries, rules, or lore by keyword.
						</p>
					</div>

					<div className="max-w-4xl mx-auto">
						<Search />
					</div>
				</div>
			</section>
		</main>
	);
};

export default Page;
