import { Metadata } from 'next';
import PageHero from '@/app/components/common/PageHero';
import { mdiDiceMultiple } from '@mdi/js';
import CreatureRollerWrapper from './CreatureRollerWrapper';

export const metadata: Metadata = {
	title: 'Creature Roller | Atom Magic',
	description:
		'A tool for Dominus Ludi to generate and roll creatures for encounters in the world of Solum.',
};

export default function Page() {
	return (
		<main className="min-h-screen bg-parchment">
			<PageHero
				title="Creature Roller"
				description="A tool for Dominus Ludi to quickly generate and roll creatures for encounters. Filter by environment, challenge level, or type, then roll to select a random creature."
				icon={mdiDiceMultiple}
				accentColor="bronze"
			/>
			<section className="container px-6 md:px-8 py-12">
				<CreatureRollerWrapper />
			</section>
		</main>
	);
}
