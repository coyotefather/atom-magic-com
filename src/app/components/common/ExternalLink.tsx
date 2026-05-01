/**
 * ExternalLink.tsx
 *
 * A styled anchor tag for links that open outside the Atom Magic site.
 * Renders the link text followed by a small "open in new tab" icon
 * (mdiOpenInNew at 0.5 size) so users can tell at a glance that the link
 * leaves the site. The tab target is "_new" and the link turns oxblood on
 * hover.
 *
 * Props:
 *   - href: string  — the destination URL
 *   - name: string  — visible link text
 *
 * Used by:
 *   - Codex articles and other rich-text content where external references
 *     need to be clearly distinguished from internal navigation
 */

import Icon from '@mdi/react';
import { mdiOpenInNew } from '@mdi/js';

const ExternalLink = ({
		href,
		name
	}: {
		href: string,
		name: string
	}) => {
	return (
		<a href={href} target="_new" className="hover:text-oxblood font-extrabold">
			{name}
			<Icon className="ml-1 inline-block align-baseline" size={0.5} path={mdiOpenInNew} />
		</a>
	);
};

export default ExternalLink;