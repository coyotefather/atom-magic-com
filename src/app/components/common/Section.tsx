interface DivProps extends React.ButtonHTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Section = ({className, children}: DivProps) => {
	return (
		<div className={`${className}`}>
			<div className="container">
				{children}
			</div>
		</div>
	);
};

export default Section;