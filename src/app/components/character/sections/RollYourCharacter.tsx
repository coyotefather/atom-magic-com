import { mdiDiceMultiple } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';

const RollYourCharacter = () => {

	let rollCharacter = () => {
		console.log("roll character");
	};

	return (
		<div className="grid grid-cols-2 w-full bg-standard-gradient border-t-2">
			<div className="flex justify-end pt-16 pb-16">
				<div className="max-w-[673px] pr-4">
					<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">Roll a Character?</h2>
					Want to skip manually creating a character and just create one automatically? You can adjust everything later. If not, continue below to create your character.
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