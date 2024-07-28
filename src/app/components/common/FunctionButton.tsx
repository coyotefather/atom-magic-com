'use client';
import { Button, Link } from "@nextui-org/react";
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
	if(variant == "secondary") { buttonColor = "bg-black border-white hover:bg-white hover:text-black text-white hover:border-black" }
	if(variant == "gradient") { buttonColor = "gradient border-black hover:bg-brightgold"; }
	if(buttonIcon != "") { icon = (
		<Icon
			path={buttonIcon}
			className="inline ml-2"
			size={1}
			horizontal
			vertical />
	); }
	return (
		<Button
			onClick={() => buttonFunction()}
			radius="full"
			size="lg"
			variant="bordered"
			className={`${buttonColor} inconsolata uppercase tracking-widest p-2 pl-4 pr-4`}>
		  		<strong>
			  		{children}
			  		{icon}
		  		</strong>
		</Button>
	);
};

export default FunctionButton;