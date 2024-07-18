'use client';

const Score = ({
		score,
	}: {
		score: {
			name: string,
			children: {
				name: string,
				value: string
			}[],
			elective: {
				name: string,
				value: string
			}
		},
	}) => {
	return (
		<div className="w-full mb-4">
			<h3 className="marcellus text-lg border-b-2 border-solid mb-4">
				{score.name}
				<span className="float-right font-bold">50</span>
			</h3>
			{score.children.map((subscore) => (
				<div className="mb-4" key={subscore.name}>
					{subscore.name}
					<span className="float-right">50</span>
					<div className="text-sm">Modifiers</div>
				</div>
			))}
			<div className="mt-2 mb-8">
				{score.elective.name}
				<span className="float-right">5</span>
			</div>
			<div className="text-sm text-right">
				<div>
					{score.name} points available: 0/200
				</div>
				<div>
				Elective points available: 0/20
				</div>
			</div>
		</div>
	);
};

export default Score;