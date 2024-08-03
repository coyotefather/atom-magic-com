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

	const [advancedEditing, setAdvancedEditing] = useState(false);
	const [expanded, setExpanded] = useState({
		RollYourCharacter: true,
		TheBasics: false,
		ChooseCulture: false,
		ChoosePath: false,
		ChoosePatronage: false,
		AdjustScoresAndScores: false,
		RollGearAndGear: false
	});

	let rollCharacter= () => {
		console.log("roll character");
		setAdvancedEditing(true);
	};
	let rollGear = () => {
		console.log("roll gear");
	};
	return (
		<div className="mt-8">
			<Section
				expanded={expanded.RollYourCharacter}
				name=""
				variant="dual">
				<RollYourCharacter />
			</Section>
			<Section
				expanded={expanded.TheBasics}
				name=""
				variant="dual">
				<TheBasics />
			</Section>
			<Section
				expanded={expanded.ChooseCulture}
				name=""
				variant="dual">
				<ChooseCulture />
			</Section>
			<Section
				expanded={expanded.ChoosePath}
				name=""
				variant="dual">
				<ChoosePath />
			</Section>
			<Section
				expanded={expanded.ChoosePatronage}
				name=""
				variant="dual">
				<ChoosePatronage />
			</Section>
			<Section
				expanded={expanded.AdjustScoresAndScores}
				name=""
				variant="dark">
				<AdjustScores />
			</Section>
			<Section
				expanded={expanded.AdjustScoresAndScores}
				name=""
				variant="dual">
				<Scores />
			</Section>
			<Section
				expanded={expanded.RollGearAndGear}
				name=""
				variant="dual">
				<RollGear />
			</Section>
		</div>
	);
};

export default Sections;