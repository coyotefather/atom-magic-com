const Header = ({
		name, children
	}: {
		name: string,
		children: React.ReactNode
	}) => {
	return (
		<div className="w-full mt-4 mb-4">
			<h1 className="w-full mb-2 text-2xl">{name}</h1>
			<p className="w-full mb-2">{children}</p>
		</div>
	);
};

export default Header;