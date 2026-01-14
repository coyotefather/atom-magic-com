import { TIMELINE_QUERY_RESULT } from '../../../../sanity.types';
import TimelineItem from '@/app/components/codex/TimelineItem';
import {
	mdiHuman,
	mdiHumanQueue,
	mdiMap,
	mdiWaves,
	mdiImageFilterHdr,
	mdiSwordCross,
	mdiShieldSun,
	mdiPineTree,
	mdiBird,
	mdiPaw,
	mdiSnake,
	mdiFire,
	mdiBottleTonicSkull,
	mdiHammerScrewdriver,
	mdiAtom,
	mdiNuke,
} from '@mdi/js';

export default function Timeline({
	timeline,
}: {
	timeline: TIMELINE_QUERY_RESULT;
}) {
	const iconPaths = new Map<string, string>();
	iconPaths.set('person', mdiHuman);
	iconPaths.set('people', mdiHumanQueue);
	iconPaths.set('map', mdiMap);
	iconPaths.set('waves', mdiWaves);
	iconPaths.set('mountain', mdiImageFilterHdr);
	iconPaths.set('swords', mdiSwordCross);
	iconPaths.set('shield', mdiShieldSun);
	iconPaths.set('tree', mdiPineTree);
	iconPaths.set('bird', mdiBird);
	iconPaths.set('wolf', mdiPaw);
	iconPaths.set('snake', mdiSnake);
	iconPaths.set('fire', mdiFire);
	iconPaths.set('poison', mdiBottleTonicSkull);
	iconPaths.set('hammer', mdiHammerScrewdriver);
	iconPaths.set('atom', mdiAtom);
	iconPaths.set('nuke', mdiNuke);

	return (
		<section className="py-12 md:py-16">
			<div className="container px-6 md:px-8">
				<div className="relative mx-auto max-w-4xl">
					{/* Central timeline bar */}
					<div className="absolute h-full w-[4px] mx-auto left-0 right-0 z-1">
						<div className="w-[4px] mt-6 h-full bg-gradient-to-b from-gold via-gold to-stone/20" />
					</div>

					{/* Timeline items */}
					{timeline.map((t, index) => (
						<TimelineItem
							key={t._id || index}
							t={t}
							index={index}
							iconPaths={iconPaths}
							count={timeline.length}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
