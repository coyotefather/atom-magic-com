import clsx from 'clsx';

interface DivProps extends React.ButtonHTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Section = ({
		name,
		variant,
		children
	}: {
		name: String,
		variant: String,
		children: DivProps
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