import Link from 'next/link';

const Button = ({href, variant, children}) => {
	let buttonColor = "bg-gold hover:bg-brightgold";
	if(variant == "secondary") { buttonColor = "bg-black hover:bg-brightgold text-white" }
	return (
		<Link href={href}>
		  <button
			className={`${buttonColor} marcellus tracking-widest p-2 rounded-md`}>
			{children}</button>
		</Link>
	);
};

export default Button;