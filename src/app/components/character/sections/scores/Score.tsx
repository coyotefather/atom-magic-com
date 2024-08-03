'use client';
import Icon from '@mdi/react';
import { mdiPlus, mdiMinus } from '@mdi/js';
import { PATHS } from '@/app/lib/global-data';
import SubScore from '@/app/components/character/sections/scores/SubScore';

const Score = ({
		score,
		modifiers
	}: {
		score: {
			name: string,
			children: {
				name: string,
				id: string,
				value: number
			}[],
			elective: {
				name: string,
				id: string,
				value: number
			}
		},
		modifiers: Map
	}) => {
	return (
		<div className="w-full mb-8">
			<h3 className="marcellus text-2xl border-b-2 border-solid mb-2">
				{score.name}
				<span className="float-right font-bold">50</span>
			</h3>
			{score.children.map((subscore) => (
				<SubScore
					subscore={subscore.name}
					value={modifiers.get(subscore.id)}
					key={subscore.id} />
			))}
			<div className="text-xl mt-2 mb-8">
				{score.elective.name}
				<div className="float-right flex justify-between w-24">
					<Icon className="my-auto" path={mdiMinus} size={0.75} />
					5
					<Icon className="my-auto" path={mdiPlus} size={0.75} />
				</div>
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