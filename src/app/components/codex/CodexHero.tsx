'use client';
import Icon from '@mdi/react';
import { mdiBookOpenPageVariant } from '@mdi/js';

const CodexHero = () => {
	return (
		<section className="relative bg-parchment border-b-2 border-stone overflow-hidden">
			{/* Subtle geometric pattern */}
			<div
				className="absolute inset-0 opacity-[0.02]"
				style={{
					backgroundImage: `linear-gradient(45deg, var(--color-stone) 25%, transparent 25%),
						linear-gradient(-45deg, var(--color-stone) 25%, transparent 25%),
						linear-gradient(45deg, transparent 75%, var(--color-stone) 75%),
						linear-gradient(-45deg, transparent 75%, var(--color-stone) 75%)`,
					backgroundSize: '20px 20px',
					backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
				}}
			/>

			{/* Top decorative line */}
			<div className="absolute top-0 left-0 w-full h-1 bg-gold" />

			<div className="container relative z-10 py-12 md:py-16 px-6 md:px-8">
				<div className="max-w-4xl mx-auto text-center">
					{/* Icon */}
					<div className="flex justify-center mb-6">
						<div className="w-16 h-16 flex items-center justify-center border-2 border-gold">
							<Icon
								path={mdiBookOpenPageVariant}
								size={1.75}
								className="text-gold"
							/>
						</div>
					</div>

					{/* Title */}
					<h1 className="marcellus text-4xl md:text-5xl text-black tracking-wide mb-4">
						The Codex
					</h1>

					{/* Description */}
					<p className="text-lg text-stone-dark max-w-2xl mx-auto leading-relaxed">
						Your guide to the world of Solum. Explore the lore, master the
						disciplines, and learn the rules that govern practitioners of atomic
						manipulation.
					</p>

					{/* Decorative divider */}
					<div className="flex items-center justify-center gap-4 mt-8">
						<div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/50" />
						<div className="w-2 h-2 rotate-45 border border-gold/50" />
						<div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/50" />
					</div>
				</div>
			</div>
		</section>
	);
};

export default CodexHero;
