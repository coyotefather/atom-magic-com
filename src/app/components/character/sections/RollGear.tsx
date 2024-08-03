import { mdiDiceMultiple } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';

const RollGear = () => {

	let rollGear = () => {
		console.log("roll gear");
	};

	return (
		<div className="grid grid-cols-2 w-full bg-standard-gradient">
			<div className="flex justify-end pt-16 pb-16">
				<div className="max-w-[673px] pr-4">
					<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">Roll Gear</h2>
					Every character starts with a basic gear kit and rolls additional unique items and wealth.
				</div>
			</div>
			<div className="pt-16 pb-16">
				<div className="max-w-[768px] pl-4 h-full grid grid-cols-1 content-center">
					<div className="text-center">
						<FunctionButton
							buttonFunction={rollGear}
							buttonIcon={mdiDiceMultiple}
							variant="secondary">Roll Gear</FunctionButton>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RollGear;