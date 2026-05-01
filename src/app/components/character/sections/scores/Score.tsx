/**
 * Score.tsx
 *
 * Renders one of the four primary score categories (Physical, Interpersonal,
 * Intellect, or Psyche) as a headed group of subscore controls. Each score
 * category has a title, an aggregate value (shown in the heading's float-right),
 * and a list of individual subscores managed by `SubScore` components.
 *
 * Responsibilities:
 *   - Renders the category title and its current aggregate value.
 *   - Iterates over the category's subscores and renders a `SubScore` for each,
 *     passing down the relevant path and gear modifiers filtered to that subscore's ID.
 *   - Displays "Score points available: X/800" at the bottom of the group so the
 *     player knows how many points remain to distribute across this category.
 *
 * The path modifier filtering works as follows: `Sections.tsx` builds a flat
 * `modifiers.path` array containing { _id: subscoreId, parent_id: scoreId, value }.
 * Score.tsx receives only the slice of that array where `parent_id === score._id`,
 * then further filters to the specific `subscore._id` before passing to SubScore.
 * This way each SubScore only sees modifiers relevant to it.
 *
 * Note: An elective score control (1–10 scale) and its point display are currently
 * commented out in the JSX. The commented-out code is left as a placeholder for a
 * future feature.
 *
 * Props:
 *   - score: the score object from Redux state (id, title, value, subscores array)
 *   - scoreValue: the pre-computed aggregate value for the score (passed from Scores)
 *   - pathModifiers: Modifier[] filtered to this score's parent_id
 *   - gearModifiers: Modifier[] filtered to this score's parent_id
 *   - availablePoints: how many points remain to distribute (from Redux scorePoints)
 *
 * Used by:
 *   - Scores.tsx (one Score rendered per entry in character.scores array)
 */
'use client';
import Icon from '@mdi/react';
import { mdiPlus, mdiMinus } from '@mdi/js';
import { PATHS } from '@/lib/global-data';
import SubScore from '@/app/components/character/sections/scores/SubScore';

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
			value: number | null,
			subscores: {
				_id: string,
				title: string | null,
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
				<SubScore
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