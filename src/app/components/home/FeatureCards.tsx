'use client';
import Link from 'next/link';
import Icon from '@mdi/react';
import { mdiBookOpenPageVariant, mdiAccountEdit, mdiChessRook } from '@mdi/js';

interface FeatureCardProps {
	title: string;
	description: string;
	href: string;
	icon: string;
	accentColor: string;
}

const FeatureCard = ({ title, description, href, icon, accentColor }: FeatureCardProps) => {
	return (
		<Link
			href={href}
			className="group block no-underline"
		>
			<article className="relative h-full bg-white border-2 border-stone hover:border-gold transition-colors p-6 md:p-8">
				{/* Accent line */}
				<div
					className="absolute top-0 left-0 w-full h-1 transition-all group-hover:h-1.5"
					style={{ backgroundColor: accentColor }}
				/>

				{/* Icon */}
				<div
					className="w-12 h-12 flex items-center justify-center mb-4 border-2"
					style={{ borderColor: accentColor }}
				>
					<Icon
						path={icon}
						size={1.25}
						style={{ color: accentColor }}
					/>
				</div>

				{/* Content */}
				<h3 className="marcellus text-2xl text-black mb-3 group-hover:text-gold transition-colors">
					{title}
				</h3>
				<p className="text-stone-dark leading-relaxed text-sm md:text-base">
					{description}
				</p>

				{/* Arrow indicator */}
				<div className="mt-6 flex items-center gap-2 text-stone group-hover:text-gold transition-colors">
					<span className="text-sm marcellus uppercase tracking-wider">Enter</span>
					<span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
				</div>
			</article>
		</Link>
	);
};

const FeatureCards = () => {
	const features = [
		{
			title: 'Codex',
			description: 'Discover the lore of Solum, master the disciplines of atomic manipulation, and learn the rules that govern this world.',
			href: '/codex',
			icon: mdiBookOpenPageVariant,
			accentColor: 'var(--color-gold)',
		},
		{
			title: 'Character Manager',
			description: 'Build a practitioner from the ground up. Choose your culture, path, and disciplines, then roll for gear and wealth.',
			href: '/character',
			icon: mdiAccountEdit,
			accentColor: 'var(--color-oxblood)',
		},
		{
			title: 'Vorago',
			description: 'Play the strategic board game of Vorago. Race to move your stones to the center while wielding the power of Cardinal coins.',
			href: '/vorago',
			icon: mdiChessRook,
			accentColor: 'var(--color-laurel)',
		},
	];

	return (
		<section className="bg-parchment py-16 md:py-24">
			<div className="container px-6 md:px-8">
				{/* Section header */}
				<div className="text-center mb-12">
					<h2 className="marcellus text-3xl md:text-4xl text-black mb-4">
						Begin Your Journey
					</h2>
					<p className="text-stone-dark max-w-xl mx-auto">
						Everything you need to explore Solum and play Atom Magic.
					</p>
				</div>

				{/* Cards grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
					{features.map((feature) => (
						<FeatureCard key={feature.title} {...feature} />
					))}
				</div>
			</div>
		</section>
	);
};

export default FeatureCards;
