import Link from 'next/link';

const Button = ({href, variant, children}) => {
	let buttonColor = "";
	if(variant == "primary") { buttonColor = "bg-gold hover:bg-brightgold"; }
	if(variant == "secondary") { buttonColor = "bg-black hover:bg-brightgold text-white" }
	if(variant == "gradient") { buttonColor = "gradient"; }
	return (
		<Link href={href}>
		  <button
			className={`${buttonColor} roboto uppercase tracking-widest p-2 pl-4 pr-4 rounded-full`}>
			{children}</button>
		</Link>
	);
};

export default Button;