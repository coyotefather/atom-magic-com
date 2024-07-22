'use client';
import clsx from 'clsx';
import FunctionButton from '@/app/components/common/FunctionButton';

const Section = ({
		variant,
		name = "",
		children
	}: {
		variant: string,
		name: string,
		children: React.ReactNode
	}) => {
	let headTag = (<></>);
	if(name !== "") {
		headTag = (<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">{name}</h2>);
	}
	return (
		<div className={clsx(
			'',
			{
				'pt-16 pb-16 container': variant === 'dark' || variant === 'light'
			},
		)}>
			{headTag}
			{children}
		</div>
	);
};

export default Section;