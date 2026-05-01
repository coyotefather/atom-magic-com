/**
 * Nav.tsx
 *
 * The site navigation link list, used inside the global site header. Renders
 * a set of Next.js Links styled with Marcellus font, wide letter-spacing, and
 * gold highlighting for the active route.
 *
 * Active route detection: a link is considered active if the current pathname
 * starts with the link's `href` (or is an exact match for the root "/").
 * Active links receive a gold underline border in extended mode, or simply
 * gold text in compact mode.
 *
 * The `extended` flag controls two layout modes:
 *   - extended = true  — shows ALL nav items with `p-1` spacing and an
 *                        underline on the active item; used in expanded/mobile
 *                        menus or sidebars
 *   - extended = false — shows only items where `item.extended !== true`
 *                        (i.e., the short-form items); used in the top header
 *                        bar. Items named "SEARCH" are replaced with a search
 *                        icon (mdiMagnify) instead of text.
 *
 * Props:
 *   - items: { href, name, extended }[]  — nav link definitions; set
 *     `extended: true` on items that should only appear in the expanded view
 *   - extended: boolean   — which display mode to use (see above)
 *   - navClasses: string  — additional Tailwind classes added to the <nav>
 *                           element (e.g. flex-direction, gap, alignment)
 *
 * Used by:
 *   - Global site header (src/app/components/global/SiteHeader.tsx or similar)
 */

'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from '@mdi/react';
import { mdiMagnify } from '@mdi/js';

const Nav = ({
		items, extended, navClasses
	}: {
		items: {
			href: string,
			name: string,
			extended: boolean
		}[],
		extended: boolean,
		navClasses: string
	}) => {
	const pathname = usePathname();

	const isActive = (href: string) => {
		if (href === '/') {
			return pathname === '/';
		}
		return pathname.startsWith(href);
	};

	return (
		<nav className={`marcellus ${navClasses}`} aria-label="Main navigation">
			{items.map((item) => {
					const active = isActive(item.href);
					if(extended) {
						return <Link
									className={`p-1 text-lg tracking-widest no-underline font-extrabold transition-colors ${active ? 'text-gold border-b-2 border-gold' : 'hover:text-gold'}`}
									href={item.href}
									key={item.name}
									aria-current={active ? 'page' : undefined}
								>{item.name}</Link>;
					} else if(extended === false && item.extended !== true ) {
						return <Link
									className={`p-5 text-lg tracking-widest no-underline font-extrabold transition-colors ${active ? 'text-gold' : 'hover:text-gold'}`}
									href={item.href}
									key={item.name}
									aria-current={active ? 'page' : undefined}
								>{item.name === "SEARCH" ? <Icon className="inline" path={mdiMagnify} size={1} aria-label="Search" /> : item.name}</Link>;
					} else {
						return;
					}
				}
			)}
		</nav>
	);
};

export default Nav;