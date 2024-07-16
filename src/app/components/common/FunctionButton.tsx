'use client';
import Link from 'next/link';

const FunctionButton = ({
		buttonFunction = () => { return true; }, variant = "primary", children
	}: {
		buttonFunction: Function,
		variant: string,
		children: React.ReactNode
	}) => {
	let buttonColor = "";
	if(variant == "primary") { buttonColor = "bg-gold hover:bg-brightgold"; }
	if(variant == "secondary") { buttonColor = "bg-black hover:bg-brightgold text-white" }
	if(variant == "gradient") { buttonColor = "gradient hover:bg-brightgold"; }
	return (
		<button
			onClick={() => buttonFunction()}
			className={`${buttonColor} inconsolata uppercase tracking-widest p-2 pl-4 pr-4 rounded-full`}>
			<strong>{children}</strong>
		</button>);
};

export default FunctionButton;