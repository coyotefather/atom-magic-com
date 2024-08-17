import { useRef } from 'react';
import { mdiFileDownloadOutline, mdiPrinterOutline } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';

 const WrapUp = ({
		buttonFunction,
	}: {
		buttonFunction: Function
	}) => {
	const bottomRef = useRef<null | HTMLDivElement>(null);
	const handleDownloadClick = () => {
		buttonFunction();
		console.log("download character");
	};
	const handlePrintClick = () => {
		buttonFunction();
		console.log("print character");
	};

	return (
		<div className="bg-sunset-gradient border-t-2">
			<div className="container grid grid-cols-3 pt-8 pb-8">
				<div>
					<h2 className="text-2xl mb-4">Download or Print Your Character</h2>
				</div>
				<div className="text-center">
					<FunctionButton
						isDisabled={false}
						iconOnly={false}
						buttonFunction={handleDownloadClick}
						buttonIcon={mdiFileDownloadOutline}
						variant="secondary">Download</FunctionButton>
				</div>
				<div className="text-center">
					<FunctionButton
						isDisabled={false}
						iconOnly={false}
						buttonFunction={handlePrintClick}
						buttonIcon={mdiPrinterOutline}
						variant="secondary">Generate</FunctionButton>
				</div>
			</div>
			<div ref={bottomRef}></div>
		</div>
	);
};

export default WrapUp;