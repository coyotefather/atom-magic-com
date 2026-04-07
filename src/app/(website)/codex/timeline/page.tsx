import { notFound } from 'next/navigation';
import { getPayloadClient } from '@/lib/payload';
import Timeline from '@/app/components/codex/Timeline';
import PageHero from '@/app/components/common/PageHero';
import { mdiCalendarClock } from '@mdi/js';
import Link from 'next/link';
import Icon from '@mdi/react';
import { mdiArrowLeft } from '@mdi/js';

export default async function Page() {
	const payload = await getPayloadClient();
	const result = await payload.find({
		collection: 'timeline',
		sort: '-year',
		limit: 500,
	});

	if (!result.docs.length) {
		return notFound();
	}

	return (
		<main className="notoserif bg-white">
			<PageHero
				title="Timeline of Solum"
				description="A chronological journey through the ages, from the dawn of the Autogena to the present day. Dates are measured in years before (A.R.) or after (P.R.) the Rubicon Event."
				icon={mdiCalendarClock}
				accentColor="laurel"
				theme="light"
			/>
			<Timeline timeline={result.docs} />

			<section className="bg-parchment border-t-2 border-stone">
				<div className="container px-6 md:px-8 py-6">
					<Link
						href="/codex"
						className="inline-flex items-center gap-2 text-stone hover:text-gold transition-colors no-underline"
					>
						<Icon path={mdiArrowLeft} size={0.875} />
						<span className="marcellus uppercase tracking-wider text-sm">
							Return to Codex
						</span>
					</Link>
				</div>
			</section>
		</main>
	);
}
