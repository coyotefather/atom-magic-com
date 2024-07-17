'use client';
import Link from 'next/link';
import Icon from '@mdi/react';

const FunctionButton = ({
		buttonFunction = () => { return true; },
		buttonIcon = "",
		variant = "primary",
		children
	}: {
		buttonFunction: Function,
		buttonIcon: string,
		variant: string,
		children: React.ReactNode
	}) => {
	let buttonColor = "";
	let icon = (<></>);
	if(variant == "primary") { buttonColor = "bg-gold hover:bg-brightgold"; }
	if(variant == "secondary") { buttonColor = "bg-black hover:bg-brightgold text-white" }
	if(variant == "gradient") { buttonColor = "gradient hover:bg-brightgold"; }
	if(buttonIcon != "") { icon = (
		<Icon
			path={buttonIcon}
			className="inline ml-2"
			size={1}
			horizontal
			vertical />
	); }
	return (
		<button
			onClick={() => buttonFunction()}
			className={`${buttonColor} inconsolata uppercase tracking-widest p-2 pl-4 pr-4 rounded-full`}>
			<strong>
				{children}
				{icon}
			</strong>
		</button>);
};

export default FunctionButton;