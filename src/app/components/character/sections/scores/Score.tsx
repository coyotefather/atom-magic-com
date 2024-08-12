'use client';
import Icon from '@mdi/react';
import { mdiPlus, mdiMinus } from '@mdi/js';
import { PATHS } from '@/app/lib/global-data';
import SubScore from '@/app/components/character/sections/scores/SubScore';

const Score = ({
		score,
		scoreValue,
		pathModifiers,
		gearModifiers,
		availablePoints = 0
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
		scoreValue: number,
		pathModifiers: Map<string, number>,
		gearModifiers: Map<string, number>,
		availablePoints: number
	}) => {
	return (
		<div className="mb-8">
			<h3 className="marcellus text-2xl border-b-2 border-solid mb-2">
				{score.name}
				<span className="float-right font-bold">{scoreValue}</span>
			</h3>
			{score.children.map((subscore) => (
				<SubScore
					subscore={subscore.name}
					subscoreId={subscore.id}
					parent={score.name}
					pathModifier={pathModifiers.get(subscore.id)!}
					gearModifier={gearModifiers.get(subscore.id)!}
					availablePoints={availablePoints}
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
					Score points available: {availablePoints}/800
				</div>
				<div>
					Elective points available: 0/20
				</div>
			</div>
		</div>
	);
};

export default Score;