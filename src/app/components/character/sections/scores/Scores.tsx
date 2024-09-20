'use client';
import Score from '@/app/components/character/sections/scores/Score';
import { SCORES, PATHS, GEAR } from '@/app/lib/global-data';
import {
	SCORES_QUERYResult,
	SUBSCORES_QUERYResult,
} from "../../../../../../sanity.types";
import { useAppSelector, useAppDispatch } from '@/app/lib/hooks'
import { useState, useEffect } from 'react';

const Scores = ({
		scores,
		subscores,
	}: {
		scores: SCORES_QUERYResult,
		subscores: SUBSCORES_QUERYResult,
	}) => {


	const path = useAppSelector(state => state.character.path);
	const curPath = PATHS.find((p) => p.value === path);
	const gear = useAppSelector(state => state.character.gear);
	const physicalScore = useAppSelector(state => state.character.scores.physical.value);
	const interpersonalScore = useAppSelector(state => state.character.scores.interpersonal.value);
	const intellectScore = useAppSelector(state => state.character.scores.intellect.value);
	const psycheScore = useAppSelector(state => state.character.scores.psyche.value);
	const physicalSubscores = useAppSelector(state => state.character.scores.physical.subscores);
	const interpersonalSubscores = useAppSelector(state => state.character.scores.interpersonal.subscores);
	const intellectSubscores = useAppSelector(state => state.character.scores.intellect.subscores);
	const psycheSubscores = useAppSelector(state => state.character.scores.psyche.subscores);
	const [subscorePoints, setSubscorePoints] = useState(0);
	let pathModifiersMap = new Map<string, number>([]);
	let gearModifiersMap = new Map<string, number>([]);

	useEffect(() => {
		let totalPoints = 800 - physicalSubscores.agility - physicalSubscores.speed - physicalSubscores.reflex - physicalSubscores.endurance - interpersonalSubscores.percievedAttractiveness - interpersonalSubscores.charm - interpersonalSubscores.speech - interpersonalSubscores.empathy - intellectSubscores.knowledge - intellectSubscores.criticalThinking - intellectSubscores.analysis - intellectSubscores.judgement - psycheSubscores.mentalStability - psycheSubscores.emotionalStability - psycheSubscores.focusAndConcentration - psycheSubscores.courageAndConviction;
		setSubscorePoints(totalPoints);
	},[physicalSubscores, interpersonalSubscores, intellectSubscores, psycheSubscores]); // pass to children via prop

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
		<div className="grid grid-cols-2 divide-x-2 bg-white container">
			<div className="pt-16 pb-16">
				<div className="grid 2xl:grid-cols-2 xl:grid-cols-1 gap-8 pr-4">
					<Score
						score={SCORES.physical}
						scoreValue={physicalScore}
						pathModifiers={pathModifiersMap}
						gearModifiers={gearModifiersMap}
						availablePoints={subscorePoints} />
					<Score
						score={SCORES.interpersonal}
						scoreValue={interpersonalScore}
						pathModifiers={pathModifiersMap}
						gearModifiers={gearModifiersMap}
						availablePoints={subscorePoints} />
				</div>
			</div>
			<div className="pt-16 pb-16">
				<div className="grid 2xl:grid-cols-2 xl:grid-cols-1 gap-8 pl-4">
					<Score
						score={SCORES.intellect}
						scoreValue={intellectScore}
						pathModifiers={pathModifiersMap}
						gearModifiers={gearModifiersMap}
						availablePoints={subscorePoints} />
					<Score
						score={SCORES.psyche}
						scoreValue={psycheScore}
						pathModifiers={pathModifiersMap}
						gearModifiers={gearModifiersMap}
						availablePoints={subscorePoints} />
				</div>
			</div>
		</div>
	);
};

export default Scores;