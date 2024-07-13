const Header = ({
		name, children
	}: {
		name: string,
		children: React.ReactNode
	}) => {
	return (
		<div className="container">
			<h1 className="w-full mb-2 text-2xl">{name}</h1>
			<div className="w-full mb-2">{children}</div>
		</div>
	);
};

export default Header;