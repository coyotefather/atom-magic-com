/**
 * PageHero.tsx
 *
 * The unified page hero component used at the top of every major page.
 * It replaced seven separate hero components and ensures visual consistency
 * across the site. Every hero shows a MDI icon, a Marcellus h1 heading, and
 * an optional description. An accent color drives the icon, border, and
 * decorative element colors.
 *
 * Three layout variants:
 *
 *   "full" (default)
 *     Centered, tall layout (py-12/py-16). Includes a subtle diagonal
 *     background pattern, a 1 px accent line at the very top, a 64×64 px
 *     icon box, large heading (text-4xl/5xl), description, decorative diamond
 *     divider, and an optional CTA link. Used on major section landing pages
 *     (Codex, Map, Timeline, Creatures, etc.).
 *
 *   "compact"
 *     Minimal horizontal layout (py-4, 40×40 px icon). No description or
 *     decorative elements. Used when the hero scrolls out of view and is
 *     replaced by a smaller sticky header — the Character Manager and Vorago
 *     pages swap between "full" and "compact" based on scroll position.
 *
 *   "inline"
 *     Horizontal layout with description (py-8/py-12, 48×48 px icon). Sits
 *     between "full" and "compact" — used on tool pages (Dice Roller, Loot
 *     Roller, Quick Reference, Tools index) where a tall centered hero would
 *     waste space.
 *
 * Two themes:
 *   "dark" (default) — black background, white heading, light stone description
 *   "light"          — parchment background, black heading, dark stone description
 *
 * Five accent colors: 'gold' | 'oxblood' | 'laurel' | 'bronze' | 'stone'
 * Each maps to a set of Tailwind border/text/bg/divider classes defined in
 * the `colorClasses` lookup table.
 *
 * Props:
 *   - title: string           — h1 heading text
 *   - description?: string    — optional subtitle / tagline
 *   - icon: string            — MDI icon path (from @mdi/js)
 *   - accentColor: AccentColor — color theme for icon, border, decorations
 *   - variant?: 'full' | 'compact' | 'inline'  (default: 'full')
 *   - theme?: 'dark' | 'light'                 (default: 'dark')
 *   - cta?: { label, href }   — optional call-to-action link button
 *                               (full variant only; rendered as a gold LinkButton)
 *
 * Used by:
 *   - Every major page in the (website) route group
 */

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
