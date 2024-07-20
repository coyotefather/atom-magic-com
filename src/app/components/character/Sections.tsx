'use client';
import Section from '@/app/components/common/Section';
import ButtonSection from '@/app/components/common/ButtonSection';
import TheBasics from '@/app/components/character/sections/TheBasics';
import RollYourCharacter from '@/app/components/character/sections/RollYourCharacter';
import Scores from '@/app/components/character/sections/scores/Scores';
import RollGear from '@/app/components/character/sections/RollGear';
import { mdiDiceMultiple } from '@mdi/js';

const Sections = () => {
	let rollFunction = () => {
		console.log("roll character");
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
				buttonFunction={() => rollFunction()}>
				<RollYourCharacter />
			</ButtonSection>
			<Section
				name="Adjust Your Scores"
				variant="light">
				<Scores />
			</Section>
			<ButtonSection
				name="Roll Gear and Wealth"
				variant="dark"
				buttonText="Roll Items"
				buttonIcon={mdiDiceMultiple}
				buttonFunction={() => rollFunction()}>
				<RollYourCharacter />
			</ButtonSection>
		</div>
	);
};

export default Sections;