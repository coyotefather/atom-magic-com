interface DivProps extends React.ButtonHTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Section = ({className, children}: DivProps) => {
	return (
		<div className={`flex w-full ${className}`}>
			<div className="p-24">
				{children}
			</div>
		</div>
	);
};

export default Section;