import { notFound } from 'next/navigation';
import { TIMELINE_QUERY } from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/client';
import { TIMELINE_QUERY_RESULT } from '../../../../../sanity.types';
import Timeline from '@/app/components/codex/Timeline';
import PageHero from '@/app/components/common/PageHero';
import { mdiCalendarClock } from '@mdi/js';
import Link from 'next/link';
import Icon from '@mdi/react';
import { mdiArrowLeft } from '@mdi/js';

export default async function Page() {
	const timeline = await sanityFetch<TIMELINE_QUERY_RESULT>({
		query: TIMELINE_QUERY,
	});
	if (!timeline) {
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
			<Timeline timeline={timeline} />

			{/* Footer */}
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
