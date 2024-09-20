'use client';
import { useState, useEffect } from 'react';
import Section from '@/app/components/common/Section';
import TheBasics from '@/app/components/character/sections/TheBasics';
import CharacterOptions from '@/app/components/character/sections/CharacterOptions';
import AdjustScores from '@/app/components/character/sections/scores/AdjustScores';
import AdditionalScores from '@/app/components/character/sections/scores/AdditionalScores';
import Scores from '@/app/components/character/sections/scores/Scores';
import ChooseCulture from '@/app/components/character/sections/ChooseCulture';
import ChoosePath from '@/app/components/character/sections/ChoosePath';
import ChoosePatronage from '@/app/components/character/sections/ChoosePatronage';
import ManageGear from '@/app/components/character/sections/ManageGear';
import ManageWealth from '@/app/components/character/sections/ManageWealth';
import ChooseAnimalCompanion from '@/app/components/character/sections/ChooseAnimalCompanion';
import WrapUp from '@/app/components/character/sections/WrapUp';
import { useAppSelector } from '@/app/lib/hooks';
import {
	CULTURES_QUERYResult,
	SCORES_QUERYResult,
	SUBSCORES_QUERYResult,
} from "../../../../sanity.types";

const Sections = ({
		cultures,
		scores,
		subscores,
	}:{
		cultures: CULTURES_QUERYResult,
		scores: SCORES_QUERYResult,
		subscores: SUBSCORES_QUERYResult,
	}) => {

	const character = useAppSelector(state => state.character);
	const [basicsIncomplete, setBasicsIncomplete] = useState("init");
	const [showChooseCulture, setShowChooseCulture] = useState(false);
	const [cultureIncomplete, setCultureIncomplete] = useState("init");
	const [showChoosePath, setShowChoosePath] = useState(false);
	const [pathIncomplete, setPathIncomplete] = useState("init");
	const [showChoosePatronage, setShowChoosePatronage] = useState(false);
	const [patronageIncomplete, setPatronageIncomplete] = useState("init");
	const [showAdjustScoresAndScores, setShowAdjustScoresAndScores] = useState(false);
	const [showManageGear, setShowManageGear] = useState(false);
	const [gearIncomplete, setGearIncomplete] = useState("init");
	const [showManageWealth, setShowManageWealth] = useState(false);
	const [wealthIncomplete, setWealthIncomplete] = useState("init");
	const [showChooseAnimalCompanion, setShowChooseAnimalCompanion] = useState(false);
	const [chooseAnimalCompanionIncomplete, setChooseAnimalCompanionIncomplete] = useState("init");
	const [showWrapUp, setShowWrapUp] = useState(false);
	const [clickCheck, setClickCheck] = useState(false);

	useEffect( () => {
		if(character.name === "" && clickCheck) {
			setBasicsIncomplete("Name");
		} else if(character.name === "" && !clickCheck) {
			setBasicsIncomplete("init");
		} else {
			setBasicsIncomplete("");
		}
	},[character.name, clickCheck]);

	useEffect( () => {
		if(character.culture === "" && clickCheck) {
			setCultureIncomplete("Culture");
		} else if(character.culture === "" && !clickCheck) {
			setCultureIncomplete("init");
		} else {
			setCultureIncomplete("");
		}
	},[character.culture, clickCheck]);

	useEffect( () => {
		if(character.path === "" && clickCheck) {
			setPathIncomplete("Path");
		} else if(character.path === "" && !clickCheck) {
			setPathIncomplete("init");
		} else {
			setPathIncomplete("");
		}
	},[character.path, clickCheck]);

	useEffect( () => {
		if(character.patronage === "" && clickCheck) {
			setPatronageIncomplete("Patronage");
		} else if(character.patronage === "" && !clickCheck) {
			setPatronageIncomplete("init");
		} else {
			setPatronageIncomplete("");
		}
	},[character.patronage, clickCheck]);

	useEffect( () => {
		if(character.gear.length === 0 && clickCheck) {
			setGearIncomplete("Gear");
		} else if(character.gear.length === 0 && !clickCheck) {
			setGearIncomplete("init");
		} else {
			setGearIncomplete("");
		}
	},[character.gear, clickCheck]);

	useEffect( () => {
		if(character.wealth.silver === 0 && clickCheck) {
			setWealthIncomplete("Wealth");
		} else if(character.wealth.silver === 0 && !clickCheck) {
			setWealthIncomplete("init");
		} else {
			setWealthIncomplete("");
		}
	},[character.wealth, clickCheck]);

	useEffect( () => {
		if(character.animalCompanion.id === "" && clickCheck) {
			setChooseAnimalCompanionIncomplete("Animal Companion");
		} else if(character.wealth.silver === 0 && !clickCheck) {
			setChooseAnimalCompanionIncomplete("init");
		} else {
			setChooseAnimalCompanionIncomplete("");
		}
	},[character.animalCompanion, clickCheck]);

	const rollCharacter = () => {
		setShowChooseCulture(true);
		setShowChoosePath(true);
		setShowChoosePatronage(true);
		setShowAdjustScoresAndScores(true);
		setShowManageGear(true);
		setShowManageWealth(true);
		setShowChooseAnimalCompanion(true);
		setShowWrapUp(true);
		console.log("roll character");
	};

	return (
		<div>
			<Section
				expanded={true}
				nextExpanded={true}
				incomplete={""}
				showExpandButton={false}
				variant="dual"
				clickCheck={setClickCheck}
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
				clickCheck={setClickCheck}
				expandFunction={() => setShowChooseCulture(true)}>
				<TheBasics incompleteFields={basicsIncomplete} />
			</Section>
			<Section
				expanded={showChooseCulture}
				nextExpanded={showChoosePath}
				incomplete={cultureIncomplete}
				showExpandButton={true}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => setShowChoosePath(true)}>
				<ChooseCulture
					cultures={cultures}
					incompleteFields={cultureIncomplete} />
			</Section>
			<Section
				expanded={showChoosePath}
				nextExpanded={showChoosePatronage}
				incomplete={pathIncomplete}
				showExpandButton={true}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => setShowChoosePatronage(true)}>
				<ChoosePath incompleteFields={pathIncomplete} />
			</Section>
			<Section
				expanded={showChoosePatronage}
				nextExpanded={showAdjustScoresAndScores}
				incomplete={patronageIncomplete}
				showExpandButton={true}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => setShowAdjustScoresAndScores(true)}>
				<ChoosePatronage incompleteFields={patronageIncomplete} />
			</Section>
			<Section
				expanded={showAdjustScoresAndScores}
				nextExpanded={false}
				incomplete={""}
				showExpandButton={false}
				variant="dark"
				clickCheck={setClickCheck}
				expandFunction={() => { return; }}>
				<AdjustScores />
			</Section>
			<Section
				expanded={showAdjustScoresAndScores}
				nextExpanded={false}
				incomplete={""}
				showExpandButton={false}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => { return; }}>
				<Scores
					scores={scores}
					subscores={subscores} />
			</Section>
			<Section
				expanded={showAdjustScoresAndScores}
				nextExpanded={showManageGear}
				incomplete={""}
				showExpandButton={true}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => setShowManageGear(true)}>
				<AdditionalScores />
			</Section>
			<Section
				expanded={showManageGear}
				nextExpanded={showManageWealth}
				incomplete={gearIncomplete}
				showExpandButton={true}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => setShowManageWealth(true)}>
				<ManageGear incompleteFields={gearIncomplete} />
			</Section>
			<Section
				expanded={showManageWealth}
				nextExpanded={showChooseAnimalCompanion}
				incomplete={wealthIncomplete}
				showExpandButton={true}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => setShowChooseAnimalCompanion(true)}>
				<ManageWealth incompleteFields={wealthIncomplete} />
			</Section>
			<Section
				expanded={showChooseAnimalCompanion}
				nextExpanded={showWrapUp}
				incomplete={""}
				showExpandButton={true}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => setShowWrapUp(true)}>
				<ChooseAnimalCompanion incompleteFields={chooseAnimalCompanionIncomplete} />
			</Section>
			<Section
				expanded={showWrapUp}
				nextExpanded={false}
				incomplete={""}
				showExpandButton={false}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => { return; }}>
				<WrapUp
					buttonFunction={() => { return; }} />
			</Section>
		</div>
	);
};

export default Sections;