import { useRef } from 'react';
import { mdiArrowDownBoldCircleOutline, mdiUploadCircleOutline, mdiDiceMultiple } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';

 const CharacterOptions = ({
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
		<div className="bg-sunset-gradient border-t-2">
			<div className="container grid grid-cols-3 pt-8 pb-8">
				<div className="text-center">
					<div className="text-xl pb-4">Make a New Character</div>
					<FunctionButton
						iconOnly={false}
						buttonFunction={handleStartClick}
						buttonIcon={mdiArrowDownBoldCircleOutline}
						variant="secondary">Start</FunctionButton>
				</div>
				<div className="text-center">
					<div className="text-xl pb-4">Manage a Character</div>
					<FunctionButton
						iconOnly={false}
						buttonFunction={handleUploadClick}
						buttonIcon={mdiUploadCircleOutline}
						variant="secondary">Manage</FunctionButton>
				</div>
				<div className="text-center">
					<div className="text-xl pb-4">Generate a Character</div>
					<FunctionButton
						iconOnly={false}
						buttonFunction={handleGenerateClick}
						buttonIcon={mdiDiceMultiple}
						variant="secondary">Generate</FunctionButton>
				</div>
			</div>
			<div ref={bottomRef}></div>
		</div>
	);
};

export default CharacterOptions;