'use client';
import Section from '@/app/components/common/Section';
import ButtonSection from '@/app/components/common/ButtonSection';
import TheBasics from '@/app/components/character/sections/TheBasics';
import RollYourCharacter from '@/app/components/character/sections/RollYourCharacter';
import Scores from '@/app/components/character/sections/Scores';

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
				buttonFunction={() => rollFunction()}>
				<RollYourCharacter />
			</ButtonSection>
			<Section
				name="Scores"
				variant="light">
				<Scores />
			</Section>
		</div>
	);
};

export default Sections;