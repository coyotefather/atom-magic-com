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