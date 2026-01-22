import { Metadata } from 'next';
import PageHero from '@/app/components/common/PageHero';
import { mdiBookOpenPageVariantOutline } from '@mdi/js';
import AdventureLogBuilder from '@/app/components/adventure-log/AdventureLogBuilder';

export const metadata: Metadata = {
	title: 'Adventure Log | Atom Magic',
	description:
		'Track rolls, character actions, and story events during your tabletop sessions. Export key moments for session recaps.',
};

const Page = () => {
	return (
		<main className="min-h-screen bg-parchment">
			<PageHero
				title="Adventure Log"
				description="Track rolls, character actions, and story events during your sessions. Mark key moments for 'Previously on...' recaps and export your session notes."
				icon={mdiBookOpenPageVariantOutline}
				accentColor="bronze"
			/>
			<section className="container px-6 md:px-8 py-12">
				<AdventureLogBuilder />
			</section>
		</main>
	);
};

export default Page;
