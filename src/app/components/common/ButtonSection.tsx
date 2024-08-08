'use client';
import clsx from 'clsx';
import FunctionButton from '@/app/components/common/FunctionButton';

const ButtonSection = ({
		variant,
		name = "",
		buttonText = "",
		buttonIcon = "",
		buttonFunction = () => { return true; },
		children
	}: {
		variant: string,
		name: string,
		buttonText: string,
		buttonIcon: string,
		buttonFunction: Function,
		children: React.ReactNode
	}) => {
	return (
		<div className={clsx(
			'pt-16 pb-16',
			{
				'bg-black text-white': variant === 'dark',
			},
		)}>
			<div className="container">
				<div className="grid grid-flow-col grid-cols-2">
					<div>
						<h2 className="marcellus text-3xl border-b-2 border-white border-solid mb-4">{name}</h2>
						{children}
					</div>
					<div className="m-auto">
						<FunctionButton
							isDisabled={false}
						  buttonFunction={buttonFunction}
						  buttonIcon={buttonIcon}
						  iconOnly={false}
						  variant="gradient">{buttonText}</FunctionButton>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ButtonSection;