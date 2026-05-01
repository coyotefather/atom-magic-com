/**
 * ContentCard.tsx
 *
 * A navigational card component used to link to sections, tools, or Codex
 * articles. The entire card is a Next.js Link, so clicking anywhere on it
 * navigates to `href`.
 *
 * Visual structure:
 *   - A thin colored accent line runs across the very top of the card
 *     (thickens slightly on hover).
 *   - An optional MDI icon is shown in a bordered square.
 *   - A Marcellus heading that turns gold on hover.
 *   - An optional description paragraph.
 *   - An optional "Enter →" arrow at the bottom that slides right on hover.
 *
 * Three size variants control padding and typographic scale:
 *   - "default"  — standard card (p-6/p-8, 24px icon container, text-2xl title)
 *   - "compact"  — dense layout (p-4, 40px icon, text-lg title)
 *   - "large"    — prominent card (p-8, 56px icon, text-3xl title)
 *
 * Props:
 *   - title: string          — card heading
 *   - description?: string   — optional body text
 *   - href: string           — navigation target
 *   - icon?: string          — MDI icon path (optional)
 *   - accentColor?: string   — CSS color value for the top accent bar and icon
 *                              (defaults to var(--color-gold))
 *   - variant?: 'default' | 'compact' | 'large'
 *   - showArrow?: boolean    — whether to show the "Enter →" footer (default true)
 *   - className?: string     — additional classes on the outer Link wrapper
 *
 * Used by:
 *   - Homepage feature grid
 *   - Codex landing page (discipline/culture listings)
 *   - Tools index page
 */

'use client';
import Link from 'next/link';
import Icon from '@mdi/react';
import clsx from 'clsx';

interface ContentCardProps {
	title: string;
	description?: string;
	href: string;
	icon?: string;
	accentColor?: string;
	variant?: 'default' | 'compact' | 'large';
	showArrow?: boolean;
	className?: string;
}

const ContentCard = ({
	title,
	description,
	href,
	icon,
	accentColor = 'var(--color-gold)',
	variant = 'default',
	showArrow = true,
	className,
}: ContentCardProps) => {
	const isCompact = variant === 'compact';
	const isLarge = variant === 'large';

	return (
		<Link href={href} className={clsx('group block no-underline', className)}>
			<article
				className={clsx(
					'relative h-full bg-white border-2 border-stone hover:border-gold transition-colors',
					{
						'p-4': isCompact,
						'p-6 md:p-8': !isCompact,
					}
				)}
			>
				{/* Accent line at top */}
				<div
					className="absolute top-0 left-0 w-full h-1 transition-all group-hover:h-1.5"
					style={{ backgroundColor: accentColor }}
				/>

				{/* Icon (optional) */}
				{icon && (
					<div
						className={clsx(
							'flex items-center justify-center border-2',
							{
								'w-10 h-10 mb-3': isCompact,
								'w-12 h-12 mb-4': !isCompact && !isLarge,
								'w-14 h-14 mb-5': isLarge,
							}
						)}
						style={{ borderColor: accentColor }}
					>
						<Icon
							path={icon}
							size={isCompact ? 1 : isLarge ? 1.5 : 1.25}
							style={{ color: accentColor }}
						/>
					</div>
				)}

				{/* Title */}
				<h3
					className={clsx(
						'marcellus text-black group-hover:text-gold transition-colors',
						{
							'text-lg mb-2': isCompact,
							'text-2xl mb-3': !isCompact && !isLarge,
							'text-3xl mb-4': isLarge,
						}
					)}
				>
					{title}
				</h3>

				{/* Description (optional) */}
				{description && (
					<p
						className={clsx('text-stone-dark leading-relaxed', {
							'text-sm': isCompact,
							'text-sm md:text-base': !isCompact,
						})}
					>
						{description}
					</p>
				)}

				{/* Arrow indicator */}
				{showArrow && (
					<div
						className={clsx(
							'flex items-center gap-2 text-stone group-hover:text-gold transition-colors',
							{
								'mt-3': isCompact,
								'mt-6': !isCompact,
							}
						)}
					>
						<span
							className={clsx('marcellus uppercase tracking-wider', {
								'text-xs': isCompact,
								'text-sm': !isCompact,
							})}
						>
							Enter
						</span>
						<span className="transform group-hover:translate-x-1 transition-transform">
							&rarr;
						</span>
					</div>
				)}
			</article>
		</Link>
	);
};

export default ContentCard;
