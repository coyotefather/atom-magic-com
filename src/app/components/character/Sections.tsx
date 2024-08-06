'use client';
import { useState } from 'react';
import Section from '@/app/components/common/Section';
import ButtonSection from '@/app/components/common/ButtonSection';
import TheBasics from '@/app/components/character/sections/TheBasics';
import RollYourCharacter from '@/app/components/character/sections/RollYourCharacter';
import AdjustScores from '@/app/components/character/sections/scores/AdjustScores';
import Scores from '@/app/components/character/sections/scores/Scores';
import ChooseCulture from '@/app/components/character/sections/ChooseCulture';
import ChoosePath from '@/app/components/character/sections/ChoosePath';
import ChoosePatronage from '@/app/components/character/sections/ChoosePatronage';
import RollGear from '@/app/components/character/sections/RollGear';
import { mdiDiceMultiple } from '@mdi/js';

const Sections = () => {

	const [showTheBasics, setShowTheBasics] = useState(true);
	const [showChooseCulture, setShowChooseCulture] = useState(false);
	const [showChoosePath, setShowChoosePath] = useState(false);
	const [showChoosePatronage, setShowChoosePatronage] = useState(false);
	const [showAdjustScoresAndScores, setShowAdjustScoresAndScores] = useState(false);
	const [showRollGearAndGear, setShowRollGearAndGear] = useState(false);

	const rollCharacter = () => {
		setShowChooseCulture(true);
		setShowChoosePath(true);
		setShowChoosePatronage(true);
		setShowAdjustScoresAndScores(true);
		setShowRollGearAndGear(true);
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
				<RollYourCharacter
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
				nextExpanded={showRollGearAndGear}
				showExpandButton={true}
				variant="dual"
				expandFunction={() => setShowRollGearAndGear(true)}>
				<Scores />
			</Section>
			<Section
				expanded={showRollGearAndGear}
				nextExpanded={true}
				showExpandButton={true}
				variant="dual"
				expandFunction={() => { return; }}>
				<RollGear />
			</Section>


		</div>
	);
};

export default Sections;