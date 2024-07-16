'use client';
import clsx from 'clsx';
import Button from '@/app/components/common/Button';

const Section = ({
		variant,
		name = "",
		buttonText = "",
		buttonFunction = () => { return; },
		children
	}: {
		variant: String,
		name: String,
		buttonText: String,
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
						<Button
					  	buttonFunction={buttonFunction}
					  	variant="gradient">{buttonText}</Button>
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