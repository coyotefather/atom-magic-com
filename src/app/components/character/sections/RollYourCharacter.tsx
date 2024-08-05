import { useRef } from 'react';
import { mdiArrowDownBoldCircleOutline, mdiUploadCircleOutline, mdiDiceMultiple } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';

 const RollYourCharacter = ({
		buttonFunction,
	}: {
		buttonFunction: Function
	}) => {
	const bottomRef = useRef<null | HTMLDivElement>(null);
	const handleStartClick = () => {
		if (bottomRef) {
			setTimeout( () => {
				bottomRef.current?.scrollIntoView({behavior: 'smooth', block: "start"});
			}, 500 );
		}
		console.log("start character");
	};
	const handleUploadClick = () => {
		buttonFunction();
		if (bottomRef) {
			setTimeout( () => {
				bottomRef.current?.scrollIntoView({behavior: 'smooth', block: "start"});
			}, 500 );
		}
		console.log("upload character");
	};
	const handleGenerateClick = () => {
		buttonFunction();
		if (bottomRef) {
			setTimeout( () => {
				bottomRef.current?.scrollIntoView({behavior: 'smooth', block: "start"});
			}, 500 );
		}
		console.log("roll character");
	};

	return (
		<div className="bg-standard-gradient border-t-2">
			<div className="container grid grid-cols-2 pt-8 pb-8">
				<div>
					<div className="text-lg pb-4">Make a New Character</div>
					<FunctionButton
						iconOnly={false}
						buttonFunction={handleStartClick}
						buttonIcon={mdiArrowDownBoldCircleOutline}
						variant="secondary">Start</FunctionButton>
				</div>
				<div className="flex justify-between align-end">
					<div>
						<span className="text-lg pb-4">Manage a Character</span>
						<FunctionButton
							iconOnly={true}
							buttonFunction={handleUploadClick}
							buttonIcon={mdiUploadCircleOutline}
							variant="secondary"></FunctionButton>
					</div>
					<div>
					<span className="text-lg pb-4">Generate a Character</span>
					<FunctionButton
						iconOnly={true}
						buttonFunction={handleGenerateClick}
						buttonIcon={mdiDiceMultiple}
						variant="secondary"></FunctionButton>
					</div>
				</div>
			</div>
			<div ref={bottomRef}></div>
		</div>
	);
};

export default RollYourCharacter;