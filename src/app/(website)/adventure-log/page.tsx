import { Metadata } from 'next';
import AdventureLogHero from '@/app/components/adventure-log/AdventureLogHero';
import AdventureLogBuilder from '@/app/components/adventure-log/AdventureLogBuilder';

export const metadata: Metadata = {
	title: 'Adventure Log | Atom Magic',
	description:
		'Track rolls, character actions, and story events during your tabletop sessions. Export key moments for session recaps.',
};

const Page = () => {
	return (
		<main>
			<AdventureLogHero />
			<section className="container px-6 md:px-8 py-12">
				<AdventureLogBuilder />
			</section>
		</main>
	);
};

export default Page;
