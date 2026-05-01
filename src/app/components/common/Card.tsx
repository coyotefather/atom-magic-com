/**
 * Card.tsx
 *
 * A simple image + text card used to promote a feature or section of the
 * site. Renders a fixed-height image at the top, followed by a title,
 * short description paragraph, and a navigational LinkButton.
 *
 * Styling follows the classical design system: sharp corners (no border-radius),
 * a stone-colored border, white background. The image area is 160 px tall and
 * uses `object-cover` so any aspect ratio fills cleanly.
 *
 * Props:
 *   - image: { src, alt, width, height, priority } — passed directly to
 *     next/image; set `priority: true` for above-the-fold cards
 *   - button: { href, variant, text } — navigation link rendered as a
 *     LinkButton; use "primary" for gold fill or "secondary" for outlined
 *   - title: string        — card heading
 *   - description: string  — short body text (Noto Serif styling)
 *
 * Used by:
 *   - Homepage feature grid and similar promotional sections
 */

import Image from 'next/image';
import LinkButton from '@/app/components/common/LinkButton';

const Card = ({
		image, button, title, description
	}: {
		image: {
			src: string,
			alt: string,
			width: number,
			height: number,
			priority: boolean
		},
		button: {
			href: string,
			variant: 'primary' | 'secondary',
			text: string
		},
		title: string,
		description: string
	}) => {
	return (
		<div className="border-2 border-stone bg-white shadow-md p-4">
		  <div className="flex h-40 mb-4">
			<Image
			  className="object-cover"
			  src={image.src}
			  alt={image.alt}
			  width={image.width}
			  height={image.height}
			  priority={image.priority} />
		  </div>
		  <div>
			<h2 className="text-xl pb-2">{title}</h2>
			<p className="pb-2 notoserif">{description}</p>
			<LinkButton
			  href={button.href}
			  variant={button.variant}>{button.text}</LinkButton>
		  </div>
		</div>
	);
};

export default Card;