import Link from "next/link";

const Nav = ({items, extended, ...props}) => {
	return (
		<div {...props}>
			{items.map((item) => {
					if(extended) {
						return <Link className="p-5" href={item.href} key={item.name} >{item.name}</Link>;
					} else if(extended === false && item.extended !== true ) {
						return <Link className="p-5" href={item.href} key={item.name} >{item.name}</Link>;
					} else {
						return;
					}
				}
			)}
		</div>
	);
};

export default Nav;