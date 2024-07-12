import Link from "next/link";

const Nav = ({
		items, extended, ...props
	}: {
		items: {
			href: string,
			name: string,
			extended: boolean
		}[],
		extended: boolean,
		props: Props & React.ComponentPropsWithoutRef<"div">
	}) => {
	return (
		<div {...props}>
			{items.map((item) => {
					if(extended) {
						return <Link
									className="p-5 text-lg tracking-widest text-gold hover:text-brightgold"
									href={item.href}
									key={item.name} >{item.name}</Link>;
					} else if(extended === false && item.extended !== true ) {
						return <Link
									className="p-5 text-lg tracking-widest text-gold hover:text-brightgold"
									href={item.href}
									key={item.name} >{item.name}</Link>;
					} else {
						return;
					}
				}
			)}
		</div>
	);
};

export default Nav;