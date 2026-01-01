'use client';
import ScoreRefactor from '@/app/components/character/sections/scores/ScoreRefactor';
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { initScore } from "@/lib/slices/characterSlice";
import {
	SCORES_QUERY_RESULT,
} from "../../../../../../sanity.types";
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
		scores: SCORES_QUERY_RESULT,
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
					<ScoreRefactor
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