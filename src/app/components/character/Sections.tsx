'use client';
import { useState } from 'react';
import Section from '@/app/components/common/Section';
import ButtonSection from '@/app/components/common/ButtonSection';
import TheBasics from '@/app/components/character/sections/TheBasics';
import CharacterOptions from '@/app/components/character/sections/CharacterOptions';
import AdjustScores from '@/app/components/character/sections/scores/AdjustScores';
import Scores from '@/app/components/character/sections/scores/Scores';
import ChooseCulture from '@/app/components/character/sections/ChooseCulture';
import ChoosePath from '@/app/components/character/sections/ChoosePath';
import ChoosePatronage from '@/app/components/character/sections/ChoosePatronage';
import ManageGear from '@/app/components/character/sections/ManageGear';
import { mdiDiceMultiple } from '@mdi/js';

const Sections = () => {

	const [showTheBasics, setShowTheBasics] = useState(true);
	const [showChooseCulture, setShowChooseCulture] = useState(false);
	const [showChoosePath, setShowChoosePath] = useState(false);
	const [showChoosePatronage, setShowChoosePatronage] = useState(false);
	const [showAdjustScoresAndScores, setShowAdjustScoresAndScores] = useState(false);
	const [showManageGear, setShowManageGear] = useState(false);

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
				showExpandButton={false}
				variant="dual"
				expandFunction={() => { return; }}>
				<CharacterOptions
					buttonFunction={() => rollCharacter()} />
			</Section>
			<Section
				expanded={showTheBasics}
				nextExpanded={showChooseCulture}
				showExpandButton={true}
				variant="dual"
				expandFunction={() => setShowChooseCulture(true)}>
				<TheBasics />
			</Section>
			<Section
				expanded={showChooseCulture}
				nextExpanded={showChoosePath}
				showExpandButton={true}
				variant="dual"
				expandFunction={() => setShowChoosePath(true)}>
				<ChooseCulture />
			</Section>
			<Section
				expanded={showChoosePath}
				nextExpanded={showChoosePatronage}
				showExpandButton={true}
				variant="dual"
				expandFunction={() => setShowChoosePatronage(true)}>
				<ChoosePath />
			</Section>
			<Section
				expanded={showChoosePatronage}
				nextExpanded={showAdjustScoresAndScores}
				showExpandButton={true}
				variant="dual"
				expandFunction={() => setShowAdjustScoresAndScores(true)}>
				<ChoosePatronage />
			</Section>
			<Section
				expanded={showAdjustScoresAndScores}
				nextExpanded={false}
				showExpandButton={false}
				variant="dark"
				expandFunction={() => { return; }}>
				<AdjustScores />
			</Section>
			<Section
				expanded={showAdjustScoresAndScores}
				nextExpanded={showManageGear}
				showExpandButton={true}
				variant="dual"
				expandFunction={() => setShowManageGear(true)}>
				<Scores />
			</Section>
			<Section
				expanded={showManageGear}
				nextExpanded={false}
				showExpandButton={true}
				variant="dual"
				expandFunction={() => { return; }}>
				<ManageGear />
			</Section>


		</div>
	);
};

export default Sections;