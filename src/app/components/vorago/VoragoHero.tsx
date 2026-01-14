'use client';
import Icon from '@mdi/react';
import { mdiChessRook } from '@mdi/js';

interface VoragoHeroProps {
	compact?: boolean;
}

const VoragoHero = ({ compact = false }: VoragoHeroProps) => {
	if (compact) {
		return (
			<section className="bg-black border-b-2 border-laurel">
				<div className="container px-6 md:px-8 py-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 flex items-center justify-center border-2 border-laurel">
							<Icon path={mdiChessRook} size={1} className="text-laurel" />
						</div>
						<h1 className="marcellus text-2xl text-white">Vorago</h1>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="relative bg-black border-b-2 border-laurel overflow-hidden">
			{/* Subtle grid pattern */}
			<div
				className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage: `linear-gradient(var(--color-laurel) 1px, transparent 1px),
						linear-gradient(90deg, var(--color-laurel) 1px, transparent 1px)`,
					backgroundSize: '24px 24px',
				}}
			/>

			{/* Accent line at top */}
			<div className="absolute top-0 left-0 w-full h-1 bg-laurel" />

			<div className="container relative z-10 py-12 md:py-16 px-6 md:px-8">
				<div className="max-w-4xl mx-auto text-center">
					{/* Icon */}
					<div className="flex justify-center mb-6">
						<div className="w-16 h-16 flex items-center justify-center border-2 border-laurel">
							<Icon path={mdiChessRook} size={1.75} className="text-laurel" />
						</div>
					</div>

					{/* Title */}
					<h1 className="marcellus text-4xl md:text-5xl text-white tracking-wide mb-4">
						Vorago
					</h1>

					{/* Description */}
					<p className="text-lg text-stone-light max-w-2xl mx-auto leading-relaxed">
						A strategic board game of movement and manipulation. Race to move
						your three stones to the center while wielding the power of the
						Cardinal coins.
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

export default VoragoHero;
