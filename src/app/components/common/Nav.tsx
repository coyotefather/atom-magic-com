import Link from "next/link";
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

	return (
		<div className={`marcellus ${navClasses}`}>
			{items.map((item) => {
					if(extended) {
						return <Link
									className="p-1 text-lg tracking-widest no-underline font-extrabold text-gold hover:text-brightgold hover:brightness-110"
									href={item.href}
									key={item.name} >{item.name}</Link>;
					} else if(extended === false && item.extended !== true ) {
						return <Link
									className="p-5 text-lg tracking-widest no-underline font-extrabold text-gold hover:text-brightgold hover:brightness-110"
									href={item.href}
									key={item.name} >{item.name === "SEARCH" ? <Icon className="inline" path={mdiMagnify} size={1} /> : item.name}</Link>;
					} else {
						return;
					}
				}
			)}
		</div>
	);
};

export default Nav;