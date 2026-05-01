/**
 * Scores.tsx
 *
 * The container that renders all four primary score categories in a 2×2 grid. It
 * is the second of the three score-related sections in the wizard (between
 * AdjustScores and AdditionalScores) and is where the player actually distributes
 * points among their subscores.
 *
 * On mount (and when the `scores` prop changes), `initScore(scores)` is dispatched
 * to Redux to populate the character's scores array from the CMS data. This handles
 * both first-time initialization and re-initialization if the CMS data changes. The
 * scores from Payload define the structure (category names, subscore names, default
 * values); the player's adjustments are tracked as deltas from there.
 *
 * The shared `scorePoints` (global remaining points budget, initialized to 800) is
 * read from Redux and passed down to each Score component so every subscore +/–
 * button knows whether there are points left to spend. Spending a point decrements
 * scorePoints in Redux; returning a point increments it.
 *
 * Modifier handling: `Sections.tsx` computes a flat `modifiers` object:
 *   { path: Modifier[], gear: Modifier[] }
 * This component filters those arrays by `parent_id === score._id` before passing
 * them to each Score component, which further filters to the specific subscore.
 *
 * Note: gear modifier code is commented out — the old Sanity-based gear modifier
 * system was removed and not yet replaced in this component.
 *
 * Props:
 *   - scores: NormedScore[] — the score structure from Payload CMS (Physical,
 *     Interpersonal, Intellect, Psyche, each with their subscores)
 *   - modifiers: { path: Modifier[], gear: Modifier[] } — subscore modifiers from
 *     the chosen path (gear modifiers are currently empty)
 *
 * Used by:
 *   - Sections.tsx (second of three score sections, same expanded state as AdjustScores)
 */
'use client';
import Score from '@/app/components/character/sections/scores/Score';
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { initScore } from "@/lib/slices/characterSlice";
import type { NormedScore } from '@/lib/character-types';
import { useEffect } from 'react';

interface Modifier {
	_id: string,
	parent_id: string,
	value: number | null
};

interface Modifiers {
	path: Modifier[],
	gear: Modifier[]
};

const Scores = ({
		scores,
		modifiers
	}: {
		scores: NormedScore[],
		modifiers: Modifiers
	}) => {

	const dispatch = useAppDispatch();
	const score = useAppSelector(state => state.character.scores);
	const scorePoints = useAppSelector(state => state.character.scorePoints);
	useEffect(()=>{
		dispatch( initScore(scores) );
	}, [scores, dispatch])
	//const gear = useAppSelector(state => state.character.gear);

// 	let gearModifiersMap = new Map<string, number>([]);
//
// 	if(gear) {
// 		gear.forEach((thisGear) => {
// 			thisGear.modifiers && thisGear.modifiers.forEach((m) =>  {
// 				let check = gearModifiersMap.get(m._if);
// 				if(check) {
// 					gearModifiersMap.set(m.key, (check + m.value));
// 				} else {
// 					gearModifiersMap.set(m.key, m.value);
// 				}
// 			});
// 		});
// 	}

	return (
		<div className="container pt-16 pb-16">
			<div className="grid grid-cols-2 gap-8 bg-white">
				{score.map((s) => (
					<Score
						key={s._id}
						score={s}
						scoreValue={s.value}
						pathModifiers={modifiers.path.filter((m) => m.parent_id === s._id)}
						gearModifiers={modifiers.gear.filter((m) => m.parent_id === s._id)}
						availablePoints={scorePoints} />
				))}
			</div>
		</div>
	);
};

export default Scores;