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
			'pt-4 pb-4',
			{
				'bg-black text-white': variant === 'dark',
			},
		)}>
			<div className="container">
				<h2 className="marcellus text-xl">{name}</h2>
				{children}
			</div>
		</div>
	);
};

export default Section;