const Header = ({title, children}) => {
	return (
		<div className="w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
			<h1>{title}</h1>
			{children}
		</div>
	);
};

export default Header;