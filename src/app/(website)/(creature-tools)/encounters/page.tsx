import { Metadata } from 'next';
import PageHero from '@/app/components/common/PageHero';
import { mdiSwordCross } from '@mdi/js';
import EncounterBuilderWrapper from './EncounterBuilderWrapper';

export const metadata: Metadata = {
	title: 'Encounter Builder | Atom Magic',
	description:
		'Build and balance encounters for your Atom Magic campaigns. Select creatures, adjust quantities, and calculate threat levels.',
};

export default function Page() {
	return (
		<main className="min-h-screen bg-parchment">
			<PageHero
				title="Encounter Builder"
				description="Build and balance encounters for your campaigns. Select creatures, adjust quantities, and see threat calculations in real-time. Save encounters for later use or export them for your session notes."
				icon={mdiSwordCross}
				accentColor="bronze"
			/>
			<section className="container px-6 md:px-8 py-12">
				<EncounterBuilderWrapper />
			</section>
		</main>
	);
}
