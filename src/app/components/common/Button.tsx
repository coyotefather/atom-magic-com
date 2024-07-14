'use client';
import Link from 'next/link';

const Button = ({
		href = "", buttonFunction = () => { return; }, variant = "primary", children
	}: {
		href: String,
		buttonFunction: Function,
		variant: String,
		children: React.ReactNode
	}) => {
	let buttonColor = "";
	if(variant == "primary") { buttonColor = "bg-gold hover:bg-brightgold"; }
	if(variant == "secondary") { buttonColor = "bg-black hover:bg-brightgold text-white" }
	if(variant == "gradient") { buttonColor = "gradient hover:bg-brightgold"; }
	return (
		<Link href={href}>
		  <button
		  	onClick={buttonFunction}
			className={`${buttonColor} inconsolata uppercase tracking-widest p-2 pl-4 pr-4 rounded-full`}>
			<strong>{children}</strong></button>
		</Link>
	);
};

export default Button;