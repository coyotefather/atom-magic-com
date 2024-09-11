const Header = ({
		name,
		//breadcrumbs,
		children
	}: {
		name: string,
		// breadcrumbs: {
		// 	page: {
		// 		title: string,
		// 		url: string,
		// 	},
		// 	parents: {
		// 		title: string,
		// 		url: string
		// 	}[]
		// },
		children: React.ReactNode
	}) => {
	return (
		<div className="bg-sunset-gradient border-b-2">
			<div className="container pt-8 pb-8">
				<h1 className="w-full mb-2 marcellus text-4xl">{name}</h1>
				<div className="w-full mb-2 notoserif">{children}</div>

			</div>
		</div>
	);
};

export default Header;