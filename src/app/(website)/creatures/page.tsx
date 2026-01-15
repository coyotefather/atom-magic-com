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
import CreatureHero from '@/app/components/creatures/CreatureHero';
import CreatureRoller from '@/app/components/creatures/CreatureRoller';

export const metadata: Metadata = {
	title: 'Creature Roller | Atom Magic',
	description:
		'A tool for Dominus Ludi to generate and roll creatures for encounters in the world of Solum.',
};

const Page = async () => {
	const [creatures, filters] = await Promise.all([
		sanityFetch<CREATURES_QUERY_RESULT>({ query: CREATURES_QUERY }),
		sanityFetch<CREATURE_FILTERS_QUERY_RESULT>({ query: CREATURE_FILTERS_QUERY }),
	]);

	return (
		<main>
			<CreatureHero />
			<section className="container px-6 md:px-8 py-12">
				<CreatureRoller creatures={creatures} filters={filters} />
			</section>
		</main>
	);
};

export default Page;
