import { Metadata } from 'next';
import PageHero from '@/app/components/common/PageHero';
import { mdiPaw } from '@mdi/js';
import CreatureManagerWrapper from './CreatureManagerWrapper';

export const metadata: Metadata = {
	title: 'Creature Manager | Atom Magic',
	description:
		'Create, customize, and manage your own creatures for Atom Magic campaigns. Build custom monsters and NPCs for your encounters.',
};

export default function Page() {
	return (
		<main className="min-h-screen bg-parchment">
			<PageHero
				title="Creature Manager"
				description="Create and customize your own creatures for campaigns. Build custom monsters and NPCs, or start from an existing Codex creature and make it your own."
				icon={mdiPaw}
				accentColor="bronze"
			/>
			<section className="container px-6 md:px-8 py-12">
				<CreatureManagerWrapper />
			</section>
		</main>
	);
}
