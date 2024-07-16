'use client';
import clsx from 'clsx';
import FunctionButton from '@/app/components/common/FunctionButton';

const Section = ({
		variant,
		name = "",
		buttonText = "",
		buttonFunction = () => { return true; },
		children
	}: {
		variant: string,
		name: string,
		buttonText: string,
		buttonFunction: Function,
		children: React.ReactNode
	}) => {
	let content = (<></>);
	if(buttonText == "") {
		content = (
			<div className="container">
				<h2 className="marcellus text-xl border-b-2 border-solid mb-4">{name}</h2>
				{children}
			</div>
		);
	} else {
		content = (
			<div className="container">
				<div className="grid grid-flow-col auto-cols-auto">
					<div>
						<h2 className="marcellus text-xl border-b-2 border-white border-solid mb-4">{name}</h2>
						{children}
					</div>
					<div className="m-auto">
						<FunctionButton
					  	buttonFunction={buttonFunction}
					  	variant="gradient">{buttonText}</FunctionButton>
					</div>
				</div>
			</div>
		);
	}
	return (
		<div className={clsx(
			'pt-8 pb-8',
			{
				'bg-black text-white': variant === 'dark',
			},
		)}>
			{content}
		</div>
	);
};

export default Section;