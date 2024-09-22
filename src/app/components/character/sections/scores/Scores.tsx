'use client';
import ScoreRefactor from '@/app/components/character/sections/scores/ScoreRefactor';
import { PATHS } from '@/lib/global-data';
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { initScore } from "@/lib/slices/characterSlice";
import {
	SCORES_QUERYResult,
} from "../../../../../../sanity.types";
import { useEffect } from 'react';

const Scores = ({
		scores
	}: {
		scores: SCORES_QUERYResult,
	}) => {

	const dispatch = useAppDispatch();
	const score = useAppSelector(state => state.character.score);
	const scorePoints = useAppSelector(state => state.character.scorePoints);
	useEffect(()=>{
		dispatch( initScore(scores) );
	}, [])
	const path = useAppSelector(state => state.character.path);
	const curPath = PATHS.find((p) => p.value === path);
	const gear = useAppSelector(state => state.character.gear);

	let pathModifiersMap = new Map<string, number>([]);
	let gearModifiersMap = new Map<string, number>([]);

	if(curPath){
		curPath.modifiers.forEach((score) =>  {
			score.modifier.forEach((m) => {
				pathModifiersMap.set(m.id, m.value);
			});
		});
	}

	if(gear) {
		gear.forEach((thisGear) => {
			thisGear.modifiers.forEach((m) =>  {
				let check = gearModifiersMap.get(m.key);
				if(check) {
					gearModifiersMap.set(m.key, (check + m.value));
				} else {
					gearModifiersMap.set(m.key, m.value);
				}
			});
		});
	}

	return (
		<div className="container pt-16 pb-16">
			<div className="grid grid-cols-2 gap-8 bg-white">
				{score.map((s) => (
					<ScoreRefactor
						key={s._id}
						score={s}
						scoreValue={s.value}
						pathModifiers={pathModifiersMap}
						gearModifiers={gearModifiersMap}
						availablePoints={scorePoints} />
				))};
			</div>
		</div>
	);
};

export default Scores;