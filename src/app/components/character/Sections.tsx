'use client';
import Section from '@/app/components/common/Section';
import ButtonSection from '@/app/components/common/ButtonSection';
import TheBasics from '@/app/components/character/sections/TheBasics';
import RollYourCharacter from '@/app/components/character/sections/RollYourCharacter';
import Scores from '@/app/components/character/sections/scores/Scores';
import ChoosePath from '@/app/components/character/sections/ChoosePath';
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
		<div>
			<Section
				name="The Basics"
				variant="light">
				<TheBasics />
			</Section>
			<ButtonSection
				name="Roll Your Character"
				variant="dark"
				buttonText="Roll Character"
				buttonIcon={mdiDiceMultiple}
				buttonFunction={() => rollCharacter()}>
				<RollYourCharacter />
			</ButtonSection>
			<Section
				name="Adjust Your Scores"
				variant="light">
				<Scores />
			</Section>
			<Section
				name="Choose Path"
				variant="light">
				<ChoosePath />
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