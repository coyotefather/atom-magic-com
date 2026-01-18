import { Metadata } from 'next';
import { sanityFetch } from '@/sanity/lib/client';
import {
	CREATURES_QUERY,
	CREATURE_FILTERS_QUERY,
} from '@/sanity/lib/queries';
import {
	CREATURES_QUERY_RESULT,
	CREATURE_FILTERS_QUERY_RESULT,
} from '../../../../sanity.types';
import EncounterHero from '@/app/components/encounters/EncounterHero';
import EncounterBuilder from '@/app/components/encounters/EncounterBuilder';

export const metadata: Metadata = {
	title: 'Encounter Builder | Atom Magic',
	description:
		'Build and balance encounters for your Atom Magic campaigns. Select creatures, adjust quantities, and calculate threat levels.',
};

const Page = async () => {
	const [creatures, filters] = await Promise.all([
		sanityFetch<CREATURES_QUERY_RESULT>({ query: CREATURES_QUERY }),
		sanityFetch<CREATURE_FILTERS_QUERY_RESULT>({ query: CREATURE_FILTERS_QUERY }),
	]);

	return (
		<main>
			<EncounterHero />
			<section className="container px-6 md:px-8 py-12">
				<EncounterBuilder creatures={creatures} filters={filters} />
			</section>
		</main>
	);
};

export default Page;
