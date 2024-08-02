'use client';
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
	let rollCharacter= () => {
		console.log("roll character");
	};
	let rollGear = () => {
		console.log("roll gear");
	};
	return (
		<div className="mt-8">
			<Section
				name=""
				variant="dual">
				<RollYourCharacter />
			</Section>
			<Section
				name=""
				variant="dual">
				<TheBasics />
			</Section>
			<Section
				name=""
				variant="dual">
				<ChooseCulture />
			</Section>
			<Section
				name=""
				variant="dual">
				<ChoosePath />
			</Section>
			<Section
				name=""
				variant="dual">
				<ChoosePatronage />
			</Section>
			<Section
				name=""
				variant="dark">
				<AdjustScores />
			</Section>
			<Section
				name=""
				variant="dual">
				<Scores />
			</Section>
			<ButtonSection
				name="Roll Gear and Wealth"
				variant="dark"
				buttonText="Roll Items"
				buttonIcon={mdiDiceMultiple}
				buttonFunction={() => rollGear()}>
				<RollGear />
			</ButtonSection>
		</div>
	);
};

export default Sections;