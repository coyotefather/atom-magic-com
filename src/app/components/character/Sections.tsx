import Section from '@/app/components/common/Section';
import TheBasics from '@/app/components/character/sections/TheBasics';
import RollYourCharacter from '@/app/components/character/sections/RollYourCharacter';

const Sections = () => {
	return (
		<div>
			<Section>
				<TheBasics />
			</Section>
			<Section variant="dark">
				<RollYourCharacter />
			</Section>
		</div>
	);
};

export default Sections;