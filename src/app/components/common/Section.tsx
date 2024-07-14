import clsx from 'clsx';

const Section = ({
		name,
		variant,
		children
	}: {
		name: String,
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
				<h2 className={clsx(
					'marcellus text-xl border-b-2 border-solid mb-4',
					{
						'border-white': variant === 'dark',
					},
				)}>{name}</h2>
				{children}
			</div>
		</div>
	);
};

export default Section;