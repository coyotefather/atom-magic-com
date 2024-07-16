'use client';
import Section from '@/app/components/common/Section';
import TheBasics from '@/app/components/character/sections/TheBasics';
import RollYourCharacter from '@/app/components/character/sections/RollYourCharacter';

const Sections = () => {
	let rollFunction = () => {
		console.log("roll character");
	};
	return (
		<div>
			<Section
				name="The Basics"
				variant="light"
				buttonText={undefined}
				buttonFunction={undefined}>
				<TheBasics />
			</Section>
			<Section
				name="Roll Your Character"
				variant="dark"
				buttonText="Roll Character"
				buttonFunction={() => rollFunction()}>
				<RollYourCharacter />
			</Section>
		</div>
	);
};

export default Sections;