const GearPaths = ({
		paths
	}:{
		paths: {
			_id: string,
			title: string | null,
		  }[] | null
	}) => {
	return (
		<div>
			{paths && paths.map( (p, index) => (
				<div className="capitalize" key={`p-${index}`}>
					{p.title}
				</div>
			))}
		</div>
	);
};

export default GearPaths;