import { TIMELINE_QUERYResult } from "../../../../sanity.types";
import clsx from 'clsx';
import Icon from '@mdi/react';
import { mdiCircleMedium, mdiRayEndArrow, mdiRayStartArrow, mdiHuman, mdiHumanQueue, mdiMap, mdiWaves, mdiImageFilterHdr, mdiSwordCross, mdiShieldSun, mdiPineTree, mdiBird, mdiPaw, mdiSnake, mdiFire, mdiBottleTonicSkull, mdiHammerScrewdriver, mdiAtom, mdiNuke } from '@mdi/js';

export default function Timeline({ timeline }: { timeline: TIMELINE_QUERYResult }) {

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
					<div
						className={clsx(
							'flex relative items-center justify-between',
							{'flex-row l-[350px]': index % 2 != 0},
							{'flex-row-reverse ': index % 2 == 0}
						)}
						key={index}>
	  <div className="hidden absolute h-[2px] w-28 bg-black m-auto left-0 right-0 top-0 bottom-0 z-1"></div>
							<Icon
							className={clsx(
								'absolute z-2 m-auto left-0 right-0 top-0 bottom-0',
								{'bg-black text-white rounded-full p-1': t.major === true},
							)}
							path={t.icon && t.major ? iconPaths.get(t.icon) : mdiCircleMedium}
							size={t.major === true ? 1.25 : 1} />
						<div className={clsx(
							'my-4 mx-0 p-4 relative min-h-12 border-2 rounded-lg',
							{'w-[300px]': index % 2 != 0},
							{'w-[300px]': index % 2 == 0}
						)}>
							<div className={clsx(
									'flex gap-4 w-full',
								)}>
								<a
			  className={clsx(
				"transition duration-200 ease-in underline",
				{'hidden': !t.URL}
			  )} href={t.URL} target="_new">{t.title}</a>
			  <span className={clsx(
				"font-bold",
				{'hidden': t.URL}
			  )}>{t.title}</span>
							</div>
							<div className="text-sm w-full">
								{t.description}
							</div>
						</div>
						<div className={clsx(
								'h-full w-[300px] flex',
			  {'justify-end': index % 2 == 0}
							)}>
							<div className="inline-block font-bold text-md bg-black text-white border-2 rounded-full py-2 px-4">
							  {t.year < 0 ? t.year * -1 + ' A.R.' : '' }
							  {t.year > 0 ? t.year + ' P.R.' : '' }
							  {t.year == 0 ? 'Anno Nulla' : '' }
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
  );
}