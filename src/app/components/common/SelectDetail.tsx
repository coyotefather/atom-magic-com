const SelectDetail = ({
		iconPath,
		name,
		description
	}: {
		iconPath: string,
		name: string,
		description: string
	}) => {
	return (
		<div className="flex justify-around max-w-[800px] mx-auto my-8 transition-all duration-200 ease-linear">
			<div className="mx-2 my-auto">
				<Icon
					path={iconPath}
					className="inline ml-2"
					size={3}
					horizontal
					vertical />
			</div>
			<div className="m-2">
				<h3 className="text-2xl border-b-2 mb-2">{name}</h3>
				<div>
					{description}
				</div>
			</div>
		</div>
	);
};

export default SelectDetail;