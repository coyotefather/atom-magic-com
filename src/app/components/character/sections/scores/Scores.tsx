'use client';
import Score from '@/app/components/character/sections/scores/Score';
import { SCORES, PATHS, GEAR } from '@/app/lib/global-data';
import { useAppSelector, useAppDispatch } from '@/app/lib/hooks'
import { useState, useEffect } from 'react';

const Scores = () => {
	const path = useAppSelector(state => state.character.path);
	const curPath = PATHS.find((p) => p.value === path);
	const gear = useAppSelector(state => state.character.gear);
	let pathModifiersMap = new Map<string, number>([]);
	let gearModifiersMap = new Map<string, number>([]);
	const physicalSubscores = useAppSelector(state => state.character.scores.physical.subscores);
	const interpersonalSubscores = useAppSelector(state => state.character.scores.interpersonal.subscores);
	const intellectSubscores = useAppSelector(state => state.character.scores.intellect.subscores);
	const psycheSubscores = useAppSelector(state => state.character.scores.psyche.subscores);
	const [physicalPoints, setPhysicalPoints] = useState(0);
	const [interpersonalPoints, setInterpersonalPoints] = useState(0);
	const [intellectPoints, setIntellectPoints] = useState(0);
	const [psychePoints, setPsychePoints] = useState(0);

	useEffect(() => {
		let totalPhysical = 200 - physicalSubscores.agility - physicalSubscores.speed - physicalSubscores.reflex - physicalSubscores.endurance;
		setPhysicalPoints(totalPhysical);
	},[physicalSubscores]); // pass to children via prop

	useEffect(() => {
		let totalInterpersonal = 200 - interpersonalSubscores.percievedAttractiveness - interpersonalSubscores.charm - interpersonalSubscores.speech - interpersonalSubscores.empathy;
		setInterpersonalPoints(totalInterpersonal);
	},[interpersonalSubscores]); // pass to children via prop

	useEffect(() => {
		let totalIntellect = 200 - intellectSubscores.knowledge - intellectSubscores.criticalThinking - intellectSubscores.analysis - intellectSubscores.judgement;
		setIntellectPoints(totalIntellect);
	},[intellectSubscores]); // pass to children via prop

	useEffect(() => {
		let totalPsyche = 200 - psycheSubscores.mentalStability - psycheSubscores.emotionalStability - psycheSubscores.focusAndConcentration - psycheSubscores.courageAndConviction;
		setPsychePoints(totalPsyche);
	},[psycheSubscores]); // pass to children via prop

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
						pathModifiers={pathModifiersMap}
						gearModifiers={gearModifiersMap}
						availablePoints={physicalPoints} />
					<Score
						score={SCORES.interpersonal}
						pathModifiers={pathModifiersMap}
						gearModifiers={gearModifiersMap}
						availablePoints={interpersonalPoints} />
				</div>
			</div>
			<div className="pt-16 pb-16">
				<div className="grid 2xl:grid-cols-2 xl:grid-cols-1 gap-8 pl-4">
					<Score
						score={SCORES.intellect}
						pathModifiers={pathModifiersMap}
						gearModifiers={gearModifiersMap}
						availablePoints={intellectPoints} />
					<Score
						score={SCORES.psyche}
						pathModifiers={pathModifiersMap}
						gearModifiers={gearModifiersMap}
						availablePoints={psychePoints} />
				</div>
			</div>
		</div>
	);
};

export default Scores;