'use client';
import Icon from '@mdi/react';
import { mdiCalendarClock } from '@mdi/js';

const TimelineHero = () => {
	return (
		<section className="relative bg-parchment border-b-2 border-stone overflow-hidden">
			{/* Subtle vertical line pattern */}
			<div
				className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage: `repeating-linear-gradient(
						90deg,
						var(--color-stone) 0px,
						var(--color-stone) 1px,
						transparent 1px,
						transparent 40px
					)`,
				}}
			/>

			{/* Top decorative line */}
			<div className="absolute top-0 left-0 w-full h-1 bg-laurel" />

			<div className="container relative z-10 py-12 md:py-16 px-6 md:px-8">
				<div className="max-w-4xl mx-auto text-center">
					{/* Icon */}
					<div className="flex justify-center mb-6">
						<div className="w-16 h-16 flex items-center justify-center border-2 border-laurel">
							<Icon
								path={mdiCalendarClock}
								size={1.75}
								className="text-laurel"
							/>
						</div>
					</div>

					{/* Title */}
					<h1 className="marcellus text-4xl md:text-5xl text-black tracking-wide mb-4">
						Timeline of Solum
					</h1>

					{/* Description */}
					<p className="text-lg text-stone-dark max-w-2xl mx-auto leading-relaxed">
						A chronological journey through the ages, from the dawn of the
						Autogena to the present day. Dates are measured in years before
						(A.R.) or after (P.R.) the Rubicon Event.
					</p>

					{/* Decorative divider */}
					<div className="flex items-center justify-center gap-4 mt-8">
						<div className="w-12 h-px bg-gradient-to-r from-transparent to-laurel/50" />
						<div className="w-2 h-2 rotate-45 border border-laurel/50" />
						<div className="w-12 h-px bg-gradient-to-l from-transparent to-laurel/50" />
					</div>
				</div>
			</div>
		</section>
	);
};

export default TimelineHero;
