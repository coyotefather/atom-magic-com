'use client';
import Link from 'next/link';
import NextImage from 'next/image';

const Hero = () => {
	return (
		<section className="relative bg-black text-white overflow-hidden">
			{/* Subtle pattern overlay */}
			<div
				className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)`,
					backgroundSize: '32px 32px',
				}}
			/>

			{/* Decorative lines */}
			<div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
			<div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

			<div className="container relative z-10 py-20 md:py-28 px-6 md:px-8">
				<div className="max-w-4xl mx-auto text-center">
					{/* Subtle atom symbol */}
					<div className="flex justify-center mb-8">
						<NextImage
							src="/atom-magic-circle-white.png"
							alt=""
							width={64}
							height={64}
							className="opacity-40"
						/>
					</div>

					{/* Main heading */}
					<h1 className="marcellus text-4xl md:text-6xl lg:text-7xl tracking-wide mb-6">
						<span className="text-gold">Atom</span> Magic
					</h1>

					{/* Tagline */}
					<p className="text-lg md:text-xl text-stone-light max-w-2xl mx-auto mb-4 leading-relaxed">
						A tabletop roleplaying game set in Solum, where practitioners
						manipulate matter at the atomic level, guided by the mysterious Cardinal forces.
					</p>

					{/* Decorative divider */}
					<div className="flex items-center justify-center gap-4 my-8">
						<div className="w-16 h-px bg-gradient-to-r from-transparent to-gold/50" />
						<div className="w-2 h-2 rotate-45 border border-gold/50" />
						<div className="w-16 h-px bg-gradient-to-l from-transparent to-gold/50" />
					</div>

					{/* CTAs */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link
							href="/codex"
							className="inline-block px-8 py-3 bg-gold text-black marcellus uppercase tracking-widest text-sm font-bold hover:bg-brightgold transition-colors no-underline"
						>
							Explore the Codex
						</Link>
						<Link
							href="/character"
							className="inline-block px-8 py-3 border-2 border-gold text-gold marcellus uppercase tracking-widest text-sm font-bold hover:bg-gold/10 transition-colors no-underline"
						>
							Create a Character
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;
