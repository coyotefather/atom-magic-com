import { useRef } from 'react';
import { mdiDownloadCircleOutline, mdiDiceMultiple } from '@mdi/js';
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
			<div className="container flex justify-around pt-8 pb-8">
				<div>
					<div>Making a new character? Start below.</div>
					<FunctionButton
						buttonFunction={handleStartClick}
						buttonIcon={mdiDownloadCircleOutline}
						variant="secondary">Start</FunctionButton>
				</div>
					<div>
						<div>Have a character already? Upload it to manage it.</div>
						<FunctionButton
							buttonFunction={handleUploadClick}
							buttonIcon={mdiDownloadCircleOutline}
							variant="secondary">Upload and Manage</FunctionButton>
					</div>
					<div>
						<div>Want to skip the line and quickly generate a character?</div>
						<FunctionButton
							buttonFunction={handleGenerateClick}
							buttonIcon={mdiDiceMultiple}
							variant="secondary">Generate</FunctionButton>
					</div>
			</div>
			<div ref={bottomRef}></div>
		</div>
	);
};

export default RollYourCharacter;