import Hero from '@/app/components/home/Hero';
import FeatureCards from '@/app/components/home/FeatureCards';
import DailyDiscovery from '@/app/components/home/DailyDiscovery';
import { getPayloadClient } from '@/lib/payload';
import { createHash } from 'crypto';
import Srand from 'seeded-rand';

export const revalidate = 86400

export default async function Home() {
	const payload = await getPayloadClient();

	const countResult = await payload.find({
		collection: 'entries',
		limit: 1,
		depth: 0,
	});
	const total = countResult.totalDocs;

	if (!total) {
		return (
			<main className="notoserif">
				<Hero />
				<FeatureCards />
			</main>
		);
	}

	// Generate a stable random number based on the current date
	const seed = createHash('sha1')
		.update(String(new Date().getDate().toString()))
		.digest()
		.readUInt32BE();
	const random = new Srand(seed).intInRange(0, total - 1);

	const entryResult = await payload.find({
		collection: 'entries',
		limit: 1,
		depth: 0,
		page: Math.floor(random) + 1,
	});

	const entry = entryResult.docs[0];

	if (!entry) {
		return (
			<main className="notoserif">
				<Hero />
				<FeatureCards />
			</main>
		);
	}

	return (
		<main className="notoserif">
			<Hero />
			<FeatureCards />
			<DailyDiscovery entry={{
				title: entry.title,
				description: entry.description ?? null,
				slug: entry.slug,
			}} />
		</main>
	);
}
