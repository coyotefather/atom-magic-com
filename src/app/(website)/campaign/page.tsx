import { Metadata } from 'next';
import PageHero from '@/app/components/common/PageHero';
import { mdiMapMarkerMultiple } from '@mdi/js';
import CampaignClientContainer from '@/app/components/campaign/CampaignClientContainer';

export const metadata: Metadata = {
	title: 'Campaign Dashboard | Atom Magic',
	description:
		'Link adventure log sessions into a campaign, track your party roster, and review key events across sessions.',
};

const Page = () => {
	return (
		<main className="min-h-screen bg-parchment">
			<PageHero
				title="Campaign Dashboard"
				description="Link sessions, track your party, and review key moments across your campaign."
				icon={mdiMapMarkerMultiple}
				accentColor="laurel"
			/>
			<section className="container px-6 md:px-8 py-12">
				<CampaignClientContainer />
			</section>
		</main>
	);
};

export default Page;
