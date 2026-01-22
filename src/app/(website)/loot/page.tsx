import { mdiTreasureChest } from '@mdi/js';
import PageHero from '@/app/components/common/PageHero';
import LootRoller from '@/app/components/tools/LootRoller';

export const metadata = {
	title: 'Loot Roller | Atom Magic',
	description: 'Generate random treasure for your Atom Magic sessions. Roll for weapons, armor, coins, and miscellaneous items.',
};

export default function LootPage() {
	return (
		<main className="notoserif min-h-screen bg-parchment">
			<PageHero
				title="Loot Roller"
				description="Generate random treasure and rewards"
				icon={mdiTreasureChest}
				accentColor="gold"
				variant="inline"
			/>

			<div className="container px-6 md:px-8 py-8 md:py-12">
				<LootRoller />
			</div>
		</main>
	);
}
