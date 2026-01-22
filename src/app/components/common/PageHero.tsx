'use client';
import Icon from '@mdi/react';
import Link from 'next/link';

type AccentColor = 'gold' | 'oxblood' | 'laurel' | 'bronze' | 'stone';

interface PageHeroProps {
	title: string;
	description?: string;
	icon: string;
	accentColor: AccentColor;
	variant?: 'full' | 'compact' | 'inline';
	theme?: 'dark' | 'light';
	cta?: {
		label: string;
		href: string;
	};
}

const colorClasses: Record<AccentColor, {
	border: string;
	text: string;
	bg: string;
	divider: string;
}> = {
	gold: {
		border: 'border-gold',
		text: 'text-gold',
		bg: 'bg-gold',
		divider: 'border-gold/50',
	},
	oxblood: {
		border: 'border-oxblood',
		text: 'text-oxblood',
		bg: 'bg-oxblood',
		divider: 'border-oxblood/50',
	},
	laurel: {
		border: 'border-laurel',
		text: 'text-laurel',
		bg: 'bg-laurel',
		divider: 'border-laurel/50',
	},
	bronze: {
		border: 'border-bronze',
		text: 'text-bronze',
		bg: 'bg-bronze',
		divider: 'border-bronze/50',
	},
	stone: {
		border: 'border-stone',
		text: 'text-stone',
		bg: 'bg-stone',
		divider: 'border-stone/50',
	},
};

const PageHero = ({
	title,
	description,
	icon,
	accentColor,
	variant = 'full',
	theme = 'dark',
	cta,
}: PageHeroProps) => {
	const colors = colorClasses[accentColor];
	const isDark = theme === 'dark';

	// Compact variant - minimal horizontal layout
	if (variant === 'compact') {
		return (
			<section className={`${isDark ? 'bg-black' : 'bg-parchment'} border-b-2 ${colors.border}`}>
				<div className="container px-6 md:px-8 py-4">
					<div className="flex items-center gap-3">
						<div className={`w-10 h-10 flex items-center justify-center border-2 ${colors.border}`}>
							<Icon path={icon} size={1} className={colors.text} />
						</div>
						<h1 className={`marcellus text-2xl ${isDark ? 'text-white' : 'text-black'}`}>
							{title}
						</h1>
					</div>
				</div>
			</section>
		);
	}

	// Inline variant - horizontal layout with description
	if (variant === 'inline') {
		return (
			<section className={`${isDark ? 'bg-black' : 'bg-parchment'} border-b-2 ${colors.border}`}>
				<div className="container px-6 md:px-8 py-8 md:py-12">
					<div className="flex items-center gap-4">
						<div className={`w-12 h-12 flex items-center justify-center border-2 ${colors.border}`}>
							<Icon path={icon} size={1.25} className={colors.text} />
						</div>
						<div>
							<h1 className={`marcellus text-3xl md:text-4xl ${isDark ? 'text-white' : 'text-black'}`}>
								{title}
							</h1>
							{description && (
								<p className={`text-sm mt-1 ${isDark ? 'text-stone-light' : 'text-stone-dark'}`}>
									{description}
								</p>
							)}
						</div>
					</div>
				</div>
			</section>
		);
	}

	// Full variant - centered layout with decorative elements
	return (
		<section className={`relative ${isDark ? 'bg-black' : 'bg-parchment'} border-b-2 ${colors.border} overflow-hidden`}>
			{/* Subtle diagonal pattern */}
			<div
				className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage: `repeating-linear-gradient(
						45deg,
						var(--color-${accentColor}) 0px,
						var(--color-${accentColor}) 1px,
						transparent 1px,
						transparent 20px
					)`,
				}}
			/>

			{/* Accent line at top */}
			<div className={`absolute top-0 left-0 w-full h-1 ${colors.bg}`} />

			<div className="container relative z-10 py-12 md:py-16 px-6 md:px-8">
				<div className="max-w-4xl mx-auto text-center">
					{/* Icon */}
					<div className="flex justify-center mb-6">
						<div className={`w-16 h-16 flex items-center justify-center border-2 ${colors.border}`}>
							<Icon path={icon} size={1.75} className={colors.text} />
						</div>
					</div>

					{/* Title */}
					<h1 className={`marcellus text-4xl md:text-5xl tracking-wide mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
						{title}
					</h1>

					{/* Description */}
					{description && (
						<p className={`text-lg max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-stone-light' : 'text-stone-dark'}`}>
							{description}
						</p>
					)}

					{/* Decorative divider */}
					<div className="flex items-center justify-center gap-4 mt-8">
						<div className={`w-12 h-px bg-gradient-to-r from-transparent to-${accentColor}/50`} />
						<div className={`w-2 h-2 rotate-45 border ${colors.divider}`} />
						<div className={`w-12 h-px bg-gradient-to-l from-transparent to-${accentColor}/50`} />
					</div>

					{/* Optional CTA */}
					{cta && (
						<div className="mt-8">
							<Link
								href={cta.href}
								className="inline-block px-8 py-3 bg-gold text-black marcellus uppercase tracking-widest text-sm font-bold hover:bg-brightgold transition-colors no-underline"
							>
								{cta.label}
							</Link>
						</div>
					)}
				</div>
			</div>
		</section>
	);
};

export default PageHero;
