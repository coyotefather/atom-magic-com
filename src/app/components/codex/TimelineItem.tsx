import clsx from 'clsx';
import Icon from '@mdi/react';
import { mdiCircle, mdiRayEndArrow, mdiRayStartArrow } from '@mdi/js';

const TimelineItem = ({
		t,
		index,
		iconPaths,
	}: {
		t: {
			_id: string,
			title: string|null,
			URL: string|null,
			year: number|null,
			major: boolean|null,
			icon:  'person'|'people'|'map'|'waves'|'mountain'|'swords'|'shield'|'tree'|'bird'|'wolf'|'snake'|'fire'|'poison'|'hammer'|'atom'|'nuke'|null,
			description: string|null,
		},
		index: number,
		iconPaths: Map<string, string>,
	}) => {

	let iconPath = t.icon && iconPaths.get(t.icon) && t.major ? iconPaths.get(t.icon) : mdiCircle;
	if(iconPath === undefined) {
		iconPath =mdiCircle;
	}

	let year = "";
	if(t.year && t.year < 0) {
		year = `${t.year * -1} A.R.`;
	} else if(t.year && t.year > 0) {
		year = `${t.year} P.R.`;
	} else {
		year = "Anno Nulla";
	}

	return (
		<div
			className={clsx(
				'flex relative items-center justify-between',
				{'flex-row l-[350px]': index % 2 != 0},
				{'flex-row-reverse ': index % 2 == 0}
			)}>
			<div className="hidden absolute h-[2px] w-28 bg-black m-auto left-0 right-0 top-0 bottom-0 z-1"></div>
			<Icon
				className={clsx(
					'absolute z-2 m-auto left-0 right-0 top-0 bottom-0 p-1 rounded-full',
					{'bg-black text-white': t.major === true},
					{'bg-white border-black border-2': t.major !== true},
				)}
				path={iconPath}
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
						)} href={t.URL ? t.URL : "" } target="_new">
						{t.title}
					</a>
					<span
						className={clsx(
						"font-bold",
						{'hidden': t.URL}
						)}>
						{t.title}
					</span>
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
					{year}
				</div>
			</div>
		</div>
	);

};

export default TimelineItem;