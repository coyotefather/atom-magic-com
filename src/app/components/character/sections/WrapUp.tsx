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
			<div className="container pt-8 pb-8">
				<div className="grid grid-cols-2 pt-8 pb-8">
					<div className="text-center text-xl">
						Print or download your completed character.
					</div>
					<div>
						<div className="flex justify-center gap-8">
							<FunctionButton
								isDisabled={false}
								iconOnly={false}
								buttonFunction={handlePrintClick}
								buttonIcon={mdiPrinterOutline}
								variant="secondary">Print</FunctionButton>
							<FunctionButton
								isDisabled={false}
								iconOnly={false}
								buttonFunction={handleDownloadClick}
								buttonIcon={mdiFileDownloadOutline}
								variant="secondary">Download</FunctionButton>
						</div>
					</div>
				</div>
			</div>
			<div ref={bottomRef}></div>
		</div>
	);
};

export default WrapUp;