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
	return (
		<div className={clsx(
			'pt-8 pb-8',
			{
				'bg-black text-white': variant === 'dark',
			},
		)}>
			<div className="container">
				<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">{name}</h2>
				{children}
			</div>
		</div>
	);
};

export default Section;