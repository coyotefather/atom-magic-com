import Icon from '@mdi/react';
import { mdiTreasureChest } from '@mdi/js';
import LootRoller from '@/app/components/tools/LootRoller';

export const metadata = {
	title: 'Loot Roller | Atom Magic',
	description: 'Generate random treasure for your Atom Magic sessions. Roll for weapons, armor, coins, and miscellaneous items.',
};

export default function LootPage() {
	return (
		<main className="notoserif min-h-screen bg-parchment">
			{/* Hero */}
			<section className="bg-black border-b-2 border-gold">
				<div className="container px-6 md:px-8 py-8 md:py-12">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 flex items-center justify-center border-2 border-gold">
							<Icon path={mdiTreasureChest} size={1.25} className="text-gold" />
						</div>
						<div>
							<h1 className="marcellus text-3xl md:text-4xl text-white">Loot Roller</h1>
							<p className="text-stone-light text-sm mt-1">Generate random treasure and rewards</p>
						</div>
					</div>
				</div>
			</section>

			<div className="container px-6 md:px-8 py-8 md:py-12">
				<LootRoller />
			</div>
		</main>
	);
}
