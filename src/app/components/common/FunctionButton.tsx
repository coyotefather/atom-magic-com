'use client';
import { Button, Link } from "@nextui-org/react";
import clsx from 'clsx';
import Icon from '@mdi/react';

const FunctionButton = ({
		buttonFunction = () => { return true; },
		buttonIcon = "",
		variant = "primary",
		iconOnly = false,
		children
	}: {
		buttonFunction: Function,
		buttonIcon: string,
		variant: string,
		iconOnly: Boolean
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
			size={1} />
	); }
	return (
		<Button
			onClick={() => buttonFunction()}
			radius="full"
			size="lg"
			variant="bordered"
			isIconOnly={iconOnly}
			endContent={icon}
			className={clsx(
				`${buttonColor} font-bold`,
				{
					'inconsolata uppercase tracking-widest p-2 pl-4 pr-4' : iconOnly === false
				}
			)}>
		  		<span>
			  		{children}
		  		</span>
		</Button>
	);
};

export default FunctionButton;