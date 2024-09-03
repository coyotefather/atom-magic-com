import { TIMELINE_QUERYResult } from "../../../../sanity.types";
import TimelineItem from '@/app/components/codex/TimelineItem';
import { mdiHuman, mdiHumanQueue, mdiMap, mdiWaves, mdiImageFilterHdr, mdiSwordCross, mdiShieldSun, mdiPineTree, mdiBird, mdiPaw, mdiSnake, mdiFire, mdiBottleTonicSkull, mdiHammerScrewdriver, mdiAtom, mdiNuke } from '@mdi/js';

export default function Timeline({
		timeline
	}: {
		timeline: TIMELINE_QUERYResult
	}) {

	let iconPaths = new Map();
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
	<div className="container my-16">
			<div className="relative w-[700px] mx-auto">
	  <div className="absolute h-full w-[14px] bg-sunset-gradient border-2 mx-auto left-0 right-0 z-1"></div>
				{timeline.map( (t, index) => (
					<TimelineItem
						key={index}
						t={t}
						index={index}
						iconPaths={iconPaths} />
				))}
			</div>
		</div>
  );
}