import { useRef } from 'react';
import { mdiArrowDownBoldCircleOutline, mdiUploadCircleOutline, mdiDiceMultiple } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';

 const CharacterOptions = ({
		buttonFunction,
	}: {
		buttonFunction: Function
	}) => {
	const bottomRef = useRef<null | HTMLDivElement>(null);
	const scrollToBottom = () => {
		if (bottomRef) {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					bottomRef.current?.scrollIntoView({behavior: 'smooth', block: "start"});
				});
			});
		}
	};
	const handleStartClick = () => {
		scrollToBottom();
	};
	const handleUploadClick = () => {
		buttonFunction();
		scrollToBottom();
	};
	const handleGenerateClick = () => {
		buttonFunction();
		scrollToBottom();
	};

	return (
		<div className="bg-white">
			<div className="container grid grid-cols-3 pt-8 pb-8">
				<div className="text-center">
					<div className="text-xl pb-4">Make a New Character</div>
					<FunctionButton
						isDisabled={false}
						iconOnly={false}
						buttonFunction={handleStartClick}
						buttonIcon={mdiArrowDownBoldCircleOutline}
						variant="secondary">Start</FunctionButton>
				</div>
				<div className="text-center">
					<div className="text-xl pb-4">Manage a Character</div>
					<FunctionButton
						isDisabled={false}
						iconOnly={false}
						buttonFunction={handleUploadClick}
						buttonIcon={mdiUploadCircleOutline}
						variant="secondary">Manage</FunctionButton>
				</div>
				<div className="text-center">
					<div className="text-xl pb-4">Generate a Character</div>
					<FunctionButton
						isDisabled={false}
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