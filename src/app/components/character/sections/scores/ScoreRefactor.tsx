'use client';
import Icon from '@mdi/react';
import { mdiPlus, mdiMinus } from '@mdi/js';
import { PATHS } from '@/lib/global-data';
import SubScoreRefactor from '@/app/components/character/sections/scores/SubScoreRefactor';

interface Modifier {
	_id: string,
	parent_id: string,
	value: number | null
};

const Score = ({
		score,
		scoreValue,
		pathModifiers,
		gearModifiers,
		availablePoints = 0
	}: {
		score: {
			_id: string,
			title: string | null,
			description: string | null,
			value: number | null,
			subscores: {
				_id: string,
				title: string | null,
				description: string | null,
				value: number | null
			}[],
		},
		scoreValue: number | null,
		pathModifiers: Modifier[],
		gearModifiers: Modifier[],
		availablePoints: number
	}) => {
	return (
		<div className="mb-4">
			<h3 className="marcellus text-2xl border-b-2 border-solid mb-2">
				{score.title}
				<span className="float-right font-bold">{scoreValue}</span>
			</h3>
			{score.subscores.map((subscore) => (
				<SubScoreRefactor
					subscore={subscore.title}
					value={subscore.value}
					subscore_id={subscore._id}
					parent_id={score._id}
					pathModifiers={pathModifiers.filter((m) => m._id === subscore._id)}
					gearModifiers={gearModifiers.filter((m) => m._id === subscore._id)}
					availablePoints={availablePoints}
					key={subscore._id} />
			))}
			{/* <div className="text-xl mt-2 mb-8">
				{score.elective.name}
				<div className="float-right flex justify-between w-24">
					<Icon className="my-auto" path={mdiMinus} size={0.75} />
					5
					<Icon className="my-auto" path={mdiPlus} size={0.75} />
				</div>
			</div> */}
			<div className="text-sm text-right">
				<div>
					Score points available: {availablePoints}/800
				</div>
				{/* <div>
					Elective points available: 0/20
				</div> */}
			</div>
		</div>
	);
};

export default Score;