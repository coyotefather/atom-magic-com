import clsx from 'clsx';
import Icon from '@mdi/react';
import { mdiCircleMedium } from '@mdi/js';

const TimelineItem = ({
		t,
		index,
		iconPaths,
		count,
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
		count: number
	}) => {

	let iconPath = t.icon && iconPaths.get(t.icon) && t.major ? iconPaths.get(t.icon) : mdiCircleMedium;
	if(iconPath === undefined) {
		iconPath = mdiCircleMedium;
	}

	let year = "";
	if(t.year && t.year < 0) {
		year = `${t.year * -1}`;
	} else if(t.year && t.year > 0) {
		year = `${t.year}`;
	} else {
		year = "ANNO NULLA";
	}

	let size = t.year === 0 ? 2 : 1.25;
	if(t.year !== 0 && !t.major) {
		size = 1;
	}
	return (
		<div
			className={clsx(
				'flex flex-row-reverse relative items-start justify-center',
				{'gap-24': t.major === true},
				{'gap-24': t.major !== true},
			)}>
			<div className={clsx(
				'p-4 w-96 relative min-h-12',
				{'my-4': t.major === true},
				{'my-2': t.major !== true}
			)}>
				<div className={clsx(
						'flex gap-4 w-full marcellus',
						{'text-xl': t.major === true},
						{'text-sm': t.major !== true},
					)}>
					{t.title}
				</div>
				<div className={clsx(
					"w-full",
					{'text-md': t.major === true},
					{'text-sm': t.major !== true},
				)}>
					<p>
					{t.description ? t.description : ""}
					</p>
					<div>
					<a
						className={clsx(
						"transition duration-200 ease-in underline",
						{'hidden': !t.URL},
						{'font-medium': t.major !== true},
						)} href={t.URL ? t.URL : "" } target="_new">
						More...
					</a>
					</div>
				</div>
			</div>
			<Icon
				className={clsx(
					'absolute mx-auto left-0 right-0 rounded-full z-3',
					{'bg-black text-white p-1 mt-8': t.major === true && t.year !== 0},
					{'bg-white border-black border-2 mt-6': t.major !== true},
					{'bg-brightgold text-black border-2 p-1 border-black mt-6': t.year === 0}
				)}
				path={iconPath}
				size={size} />
			<div className={clsx(
				'h-full w-96 flex justify-end',
				)}>
				<div className={clsx(
					"p-4 inline-block marcellus font-bold",
					{'text-xl my-4': t.major === true},
					{'text-sm my-2': t.major !== true},
				)}>
					{year}
					<span className={clsx(
						"m-1",
						{'text-sm': t.major === true},
						{'text-xs': t.major !== true},
					)}>
						{t.year && t.year < 0 ? "A.R." : ""}
						{t.year && t.year > 0 ? "P.R." : ""}
					</span>
				</div>
			</div>
		</div>
	);

};

export default TimelineItem;