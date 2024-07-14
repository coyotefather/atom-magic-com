import clsx from 'clsx';

const Section = ({
		variant,
		children
	}: {
		variant: String,
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
				{children}
			</div>
		</div>
	);
};

export default Section;