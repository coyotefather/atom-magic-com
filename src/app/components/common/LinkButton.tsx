/**
 * LinkButton.tsx
 *
 * A navigational button styled to match the project's classical design system.
 * Use this when clicking should navigate to another page (renders as a Next.js
 * Link). For click handlers that execute JavaScript, use FunctionButton instead.
 *
 * Two variants:
 *   - "primary"   — solid olive background, white text; deepens to dark olive on hover
 *   - "secondary" — olive outline with transparent background; subtle olive tint on hover
 *
 * Typography is always Marcellus, uppercase, widely tracked — consistent with
 * FunctionButton so both button types look identical in context.
 * No rounded corners (sharp edges per the classical aesthetic).
 *
 * Props:
 *   - href: string                       — navigation destination passed to Next.js Link
 *   - variant?: 'primary' | 'secondary'  — visual style (default: "primary")
 *   - children: ReactNode                — button label text
 *
 * Used by:
 *   - Card, ContentCard (feature CTAs)
 *   - Homepage hero and marketing sections
 *   - PageHero (optional CTA link)
 *   - Anywhere a styled link that looks like a button is needed
 */

import Link from 'next/link';
import clsx from 'clsx';

const LinkButton = ({
	href = '',
	variant = 'primary',
	children,
}: {
	href: string;
	variant?: 'primary' | 'secondary';
	children: React.ReactNode;
}) => {
	return (
		<Link
			href={href}
			className={clsx(
				'inline-block px-8 py-3 marcellus uppercase tracking-widest text-sm font-bold transition-colors no-underline',
				{
					'bg-olive text-white hover:bg-olive-dark': variant === 'primary',
					'border-2 border-olive-fg text-olive-fg bg-transparent hover:bg-olive-fg/10':
						variant === 'secondary',
				}
			)}
		>
			{children}
		</Link>
	);
};

export default LinkButton;