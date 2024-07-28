import { mdiDiceMultiple } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';

const RollYourCharacter = () => {

	let rollCharacter = () => {
		console.log("roll character");
	};

	return (
		<div className="grid grid-cols-2 w-full bg-standard-gradient">
			<div className="flex justify-end pt-16 pb-16">
				<div className="max-w-[673px] pr-4">
					<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">Roll a Character</h2>
					It&apos;s time to roll and set the base numbers for each stat. You can adjust the spread of points across each sub state for any stat category.
				</div>
			</div>
			<div className="pt-16 pb-16">
				<div className="max-w-[768px] pl-4 h-full grid grid-cols-1 content-center">
					<div className="text-center">
						<FunctionButton
							buttonFunction={rollCharacter}
							buttonIcon={mdiDiceMultiple}
							variant="secondary">Roll Character</FunctionButton>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RollYourCharacter;