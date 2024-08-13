'use client';
import { useState, useEffect } from 'react';
import Section from '@/app/components/common/Section';
import TheBasics from '@/app/components/character/sections/TheBasics';
import CharacterOptions from '@/app/components/character/sections/CharacterOptions';
import AdjustScores from '@/app/components/character/sections/scores/AdjustScores';
import Scores from '@/app/components/character/sections/scores/Scores';
import ChooseCulture from '@/app/components/character/sections/ChooseCulture';
import ChoosePath from '@/app/components/character/sections/ChoosePath';
import ChoosePatronage from '@/app/components/character/sections/ChoosePatronage';
import ManageGear from '@/app/components/character/sections/ManageGear';
import { useAppSelector } from '@/app/lib/hooks';

const Sections = () => {

	const character = useAppSelector(state => state.character);
	const [basicsIncomplete, setBasicsIncomplete] = useState(["Name"]);
	const [showChooseCulture, setShowChooseCulture] = useState(false);
	const [cultureIncomplete, setCultureIncomplete] = useState(["Culture"]);
	const [showChoosePath, setShowChoosePath] = useState(false);
	const [pathIncomplete, setPathIncomplete] = useState(["Path"]);
	const [showChoosePatronage, setShowChoosePatronage] = useState(false);
	const [patronageIncomplete, setPatronageIncomplete] = useState(["Patronage"]);
	const [showAdjustScoresAndScores, setShowAdjustScoresAndScores] = useState(false);
	const [showManageGear, setShowManageGear] = useState(false);
	const [gearIncomplete, setGearIncomplete] = useState(["Gear"]);

	useEffect( () => {
		if(character.name !== "") {
			setBasicsIncomplete([]);
		} else {
			setBasicsIncomplete(["Name"]);
		}
	},[character.name]);
	useEffect( () => {
		if(character.culture !== "") {
			setCultureIncomplete([]);
		} else {
			setCultureIncomplete(["Culture"]);
		}
	},[character.culture]);
	useEffect( () => {
		if(character.path !== "") {
			setPathIncomplete([]);
		} else {
			setPathIncomplete(["Path"]);
		}
	},[character.path]);
	useEffect( () => {
		if(character.patronage !== "") {
			setPatronageIncomplete([]);
		} else {
			setPatronageIncomplete(["Patronage"]);
		}
	},[character.patronage]);
	useEffect( () => {
		if(character.gear.length === 0) {
			setGearIncomplete([]);
		} else {
			setGearIncomplete(["Gear"]);
		}
	},[character.gear]);

	const rollCharacter = () => {
		setShowChooseCulture(true);
		setShowChoosePath(true);
		setShowChoosePatronage(true);
		setShowAdjustScoresAndScores(true);
		setShowManageGear(true);
		console.log("roll character");
	};

	const rollGear = () => {
		console.log("roll gear");
	};
	return (
		<div className="mt-8">
			<Section
				expanded={true}
				nextExpanded={true}
				incomplete={[]}
				showExpandButton={false}
				variant="dual"
				expandFunction={() => { return; }}>
				<CharacterOptions
					buttonFunction={() => rollCharacter()} />
			</Section>
			<Section
				expanded={true}
				nextExpanded={showChooseCulture}
				incomplete={basicsIncomplete}
				showExpandButton={true}
				variant="dual"
				expandFunction={() => setShowChooseCulture(true)}>
				<TheBasics />
			</Section>
			<Section
				expanded={showChooseCulture}
				nextExpanded={showChoosePath}
				incomplete={cultureIncomplete}
				showExpandButton={true}
				variant="dual"
				expandFunction={() => setShowChoosePath(true)}>
				<ChooseCulture />
			</Section>
			<Section
				expanded={showChoosePath}
				nextExpanded={showChoosePatronage}
				incomplete={pathIncomplete}
				showExpandButton={true}
				variant="dual"
				expandFunction={() => setShowChoosePatronage(true)}>
				<ChoosePath />
			</Section>
			<Section
				expanded={showChoosePatronage}
				nextExpanded={showAdjustScoresAndScores}
				incomplete={patronageIncomplete}
				showExpandButton={true}
				variant="dual"
				expandFunction={() => setShowAdjustScoresAndScores(true)}>
				<ChoosePatronage />
			</Section>
			<Section
				expanded={showAdjustScoresAndScores}
				nextExpanded={false}
				incomplete={[]}
				showExpandButton={false}
				variant="dark"
				expandFunction={() => { return; }}>
				<AdjustScores />
			</Section>
			<Section
				expanded={showAdjustScoresAndScores}
				nextExpanded={showManageGear}
				incomplete={[]}
				showExpandButton={true}
				variant="dual"
				expandFunction={() => setShowManageGear(true)}>
				<Scores />
			</Section>
			<Section
				expanded={showManageGear}
				nextExpanded={false}
				incomplete={gearIncomplete}
				showExpandButton={true}
				variant="dual"
				expandFunction={() => { return; }}>
				<ManageGear />
			</Section>


		</div>
	);
};

export default Sections;