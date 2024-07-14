interface DivProps extends React.ButtonHTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Section = ({name, className, children}: DivProps) => {
	return (
		<div className={`${className} pt-4 pb-4`}>
			<div className="container">
				<h2 className="marcellus text-xl">{name}</h2>
				{children}
			</div>
		</div>
	);
};

export default Section;