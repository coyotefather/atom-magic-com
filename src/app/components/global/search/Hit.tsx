import { memo } from 'react';
import Link from 'next/link';
import Icon from '@mdi/react';
import { mdiFolderText, mdiFileDocument } from '@mdi/js';

interface HitProps {
	hit: {
		type: string;
		rev: string;
		title: string;
		path: string;
		description: string;
	};
}

const Hit = memo(function Hit({ hit }: HitProps) {
	const isCategory = hit.type === 'category';
	const href = isCategory
		? `/codex/categories/${hit.path}`
		: `/codex/entries/${hit.path}`;

	return (
		<Link href={href} className="group block no-underline">
			<article className="h-full bg-white border-2 border-stone/50 hover:border-gold transition-colors p-4">
				{/* Header with icon and title */}
				<div className="flex items-start gap-3 mb-2">
					<div className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-stone/30 group-hover:border-gold transition-colors">
						<Icon
							path={isCategory ? mdiFolderText : mdiFileDocument}
							size={0.75}
							className="text-stone group-hover:text-gold transition-colors"
						/>
					</div>
					<h3 className="marcellus text-lg text-black group-hover:text-gold transition-colors leading-tight pt-1">
						{hit.title}
					</h3>
				</div>

				{/* Description */}
				{hit.description && (
					<p className="text-sm text-stone-dark leading-relaxed ml-11">
						{hit.description.length > 150
							? hit.description.slice(0, 150) + '...'
							: hit.description}
					</p>
				)}
			</article>
		</Link>
	);
});

export default Hit;
