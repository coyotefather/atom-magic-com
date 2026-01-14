import { notFound } from 'next/navigation';
import { TIMELINE_QUERY } from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/client';
import { TIMELINE_QUERY_RESULT } from '../../../../../sanity.types';
import Timeline from '@/app/components/codex/Timeline';
import TimelineHero from '@/app/components/codex/TimelineHero';
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
			<TimelineHero />
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
