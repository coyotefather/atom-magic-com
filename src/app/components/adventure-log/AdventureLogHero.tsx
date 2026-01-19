'use client';
import Icon from '@mdi/react';
import { mdiBookOpenPageVariantOutline } from '@mdi/js';

const AdventureLogHero = () => {
	return (
		<section className="relative bg-black border-b-2 border-bronze overflow-hidden">
			{/* Subtle diagonal pattern */}
			<div
				className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage: `repeating-linear-gradient(
						45deg,
						var(--color-bronze) 0px,
						var(--color-bronze) 1px,
						transparent 1px,
						transparent 20px
					)`,
				}}
			/>

			{/* Accent line at top */}
			<div className="absolute top-0 left-0 w-full h-1 bg-bronze" />

			<div className="container relative z-10 py-12 md:py-16 px-6 md:px-8">
				<div className="max-w-4xl mx-auto text-center">
					{/* Icon */}
					<div className="flex justify-center mb-6">
						<div className="w-16 h-16 flex items-center justify-center border-2 border-bronze">
							<Icon path={mdiBookOpenPageVariantOutline} size={1.75} className="text-bronze" />
						</div>
					</div>

					{/* Title */}
					<h1 className="marcellus text-4xl md:text-5xl text-white tracking-wide mb-4">
						Adventure Log
					</h1>

					{/* Description */}
					<p className="text-lg text-stone-light max-w-2xl mx-auto leading-relaxed">
						Track rolls, character actions, and story events during your sessions.
						Mark key moments for "Previously on..." recaps and export your session notes.
					</p>

					{/* Decorative divider */}
					<div className="flex items-center justify-center gap-4 mt-8">
						<div className="w-12 h-px bg-gradient-to-r from-transparent to-bronze/50" />
						<div className="w-2 h-2 rotate-45 border border-bronze/50" />
						<div className="w-12 h-px bg-gradient-to-l from-transparent to-bronze/50" />
					</div>
				</div>
			</div>
		</section>
	);
};

export default AdventureLogHero;
