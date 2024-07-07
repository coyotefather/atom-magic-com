import Link from "next/link";

const Nav = ({items, ...props}) => {
	return (
		<div {...props}>
			{items.map((item) => {
					return <Link className="p-5" href={item.href} key={item.name} >{item.name}</Link>;
				}
			)}
		</div>
	);
};

export default Nav;