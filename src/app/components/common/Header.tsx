/**
 * Header.tsx
 *
 * A simple black page header bar used on content-heavy pages (not to be
 * confused with the site-wide navigation header in Nav.tsx). Renders a
 * full-width black band with a white Marcellus h1 heading and a Noto Serif
 * description slot (children). A bottom border separates it from the page
 * content below.
 *
 * This component predates the unified PageHero component and is still used
 * on older pages. For new pages prefer PageHero, which supports accent
 * colors, icons, and three layout variants.
 *
 * Props:
 *   - name: string        — the h1 heading text
 *   - children: ReactNode — optional descriptive content (subtitle, chips, etc.)
 *
 * Used by:
 *   - Older codex and content pages that haven't been migrated to PageHero
 */

const Header = ({
		name,
		//breadcrumbs,
		children
	}: {
		name: string,
		// breadcrumbs: {
		// 	page: {
		// 		title: string,
		// 		url: string,
		// 	},
		// 	parents: {
		// 		title: string,
		// 		url: string
		// 	}[]
		// },
		children: React.ReactNode
	}) => {
	return (
		<div className="bg-black text-white border-b-2">
			<div className="container pt-8 pb-8">
				<h1 className="w-full mb-2 marcellus text-4xl">{name}</h1>
				<div className="w-full mb-2 notoserif">{children}</div>

			</div>
		</div>
	);
};

export default Header;