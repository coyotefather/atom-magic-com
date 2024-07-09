import Link from 'next/link';

const Button = ({href, variant, children}) => {
	let buttonColor = "bg-gold hover:bg-brightgold border-black";
	if(variant == "secondary") { buttonColor = "bg-black hover:bg-brightgold text-white" }
	return (
		<Link href={href}>
		  <button
			className={`${buttonColor} marcellus tracking-widest p-2 pl-4 pr-4 rounded-md border-solid border-2`}>
			{children}</button>
		</Link>
	);
};

export default Button;