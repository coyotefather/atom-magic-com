import clsx from 'clsx';
import Icon from '@mdi/react';
import { mdiCircleMedium } from '@mdi/js';
import Link from 'next/link';

const TimelineItem = ({
	t,
	index,
	iconPaths,
	count,
}: {
	t: {
		_id: string;
		title: string | null;
		URL: string | null;
		year: number | null;
		major: boolean | null;
		icon:
			| 'person'
			| 'people'
			| 'map'
			| 'waves'
			| 'mountain'
			| 'swords'
			| 'shield'
			| 'tree'
			| 'bird'
			| 'wolf'
			| 'snake'
			| 'fire'
			| 'poison'
			| 'hammer'
			| 'atom'
			| 'nuke'
			| null;
		description: string | null;
	};
	index: number;
	iconPaths: Map<string, string>;
	count: number;
}) => {
	const iconPath =
		t.icon && iconPaths.get(t.icon) && t.major
			? iconPaths.get(t.icon)
			: mdiCircleMedium;

	let year = '';
	if (t.year && t.year < 0) {
		year = `${t.year * -1}`;
	} else if (t.year && t.year > 0) {
		year = `${t.year}`;
	} else {
		year = 'ANNO NULLA';
	}

	const isRubiconEvent = t.year === 0;
	const isMajor = t.major === true;

	let iconSize = isRubiconEvent ? 2 : isMajor ? 1.25 : 0.875;

	return (
		<div className="flex flex-row-reverse relative items-start justify-center gap-8 md:gap-16">
			{/* Right side: Event content */}
			<div
				className={clsx('p-4 w-full md:w-96 relative', {
					'my-4': isMajor,
					'my-2': !isMajor,
				})}
			>
				{/* Title */}
				<h3
					className={clsx('marcellus text-black', {
						'text-xl md:text-2xl mb-2': isMajor,
						'text-base mb-1': !isMajor,
					})}
				>
					{t.title}
				</h3>

				{/* Description */}
				{t.description && (
					<p
						className={clsx('text-stone-dark leading-relaxed', {
							'text-base': isMajor,
							'text-sm': !isMajor,
						})}
					>
						{t.description}
					</p>
				)}

				{/* Link */}
				{t.URL && (
					<Link
						href={t.URL}
						className={clsx(
							'inline-block mt-2 text-gold hover:text-brightgold transition-colors no-underline',
							{
								'text-sm': isMajor,
								'text-xs': !isMajor,
							}
						)}
					>
						Read more &rarr;
					</Link>
				)}
			</div>

			{/* Center: Icon marker */}
			<div
				className={clsx(
					'absolute mx-auto left-0 right-0 z-10 flex items-center justify-center',
					{
						'mt-6': isMajor || isRubiconEvent,
						'mt-4': !isMajor && !isRubiconEvent,
					}
				)}
			>
				<div
					className={clsx('flex items-center justify-center', {
						'w-10 h-10 bg-gold border-2 border-gold': isRubiconEvent,
						'w-8 h-8 bg-black border-2 border-black': isMajor && !isRubiconEvent,
						'w-6 h-6 bg-white border-2 border-stone': !isMajor && !isRubiconEvent,
					})}
				>
					<Icon
						path={iconPath ?? mdiCircleMedium}
						size={iconSize}
						className={clsx({
							'text-black': isRubiconEvent,
							'text-white': isMajor && !isRubiconEvent,
							'text-stone': !isMajor && !isRubiconEvent,
						})}
					/>
				</div>
			</div>

			{/* Left side: Year */}
			<div className="w-full md:w-96 flex justify-end">
				<div
					className={clsx('p-4 marcellus font-bold text-right', {
						'text-xl md:text-2xl my-4': isMajor,
						'text-sm my-2': !isMajor,
					})}
				>
					<span className={clsx({ 'text-gold': isRubiconEvent })}>{year}</span>
					{t.year !== 0 && (
						<span
							className={clsx('ml-1 text-stone', {
								'text-sm': isMajor,
								'text-xs': !isMajor,
							})}
						>
							{t.year && t.year < 0 ? 'A.R.' : 'P.R.'}
						</span>
					)}
				</div>
			</div>
		</div>
	);
};

export default TimelineItem;
