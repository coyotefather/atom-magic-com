'use client';
import { Button } from "@heroui/react";
import clsx from 'clsx';
import Icon from '@mdi/react';

const FunctionButton = ({
		buttonFunction = () => { return true; },
		buttonIcon = "",
		variant = "primary",
		iconOnly = false,
		isDisabled = false,
		children
	}: {
		buttonFunction: Function,
		buttonIcon: string,
		variant: string,
		iconOnly: boolean,
		isDisabled: boolean,
		children: React.ReactNode
	}) => {
	let icon = (<></>);
	if(buttonIcon != "") {
		icon = (
			<Icon
				path={buttonIcon}
				size={0.875}
			/>
		);
	}

	return (
		<Button
			isDisabled={isDisabled}
			onClick={() => buttonFunction()}
			radius="none"
			size="lg"
			isIconOnly={iconOnly}
			startContent={icon}
			disableRipple={true}
			className={clsx(
				'marcellus uppercase tracking-widest text-sm font-bold transition-colors px-8 py-3',
				{
					'bg-gold text-black hover:bg-brightgold border-0': variant === 'primary',
					'border-2 border-gold text-gold bg-transparent hover:bg-gold/10': variant === 'secondary',
					'bg-oxblood text-white hover:bg-oxblood-dark border-0': variant === 'danger',
				},
				{ 'opacity-50 cursor-not-allowed': isDisabled }
			)}>
			{children}
		</Button>
	);
};

export default FunctionButton;