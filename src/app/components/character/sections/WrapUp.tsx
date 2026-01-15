'use client';
import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { mdiFileDownloadOutline, mdiPrinterOutline } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';
import { RootState } from '@/lib/store';
import { exportCharacterToFile } from '@/lib/characterPersistence';

const WrapUp = () => {
	const bottomRef = useRef<null | HTMLDivElement>(null);
	const character = useSelector((state: RootState) => state.character);

	const handleDownloadClick = () => {
		exportCharacterToFile(character);
	};

	const handlePrintClick = () => {
		window.print();
	};

	return (
		<div className="parchment-gradient border-t-2">
			<div className="container pt-8 pb-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 pb-8">
					<div className="text-center md:text-left text-xl flex items-center justify-center md:justify-start">
						Print or download your completed character.
					</div>
					<div>
						<div className="flex justify-center gap-4">
							<FunctionButton
								isDisabled={false}
								iconOnly={false}
								buttonFunction={handlePrintClick}
								buttonIcon={mdiPrinterOutline}
								variant="secondary"
							>
								Print
							</FunctionButton>
							<FunctionButton
								isDisabled={false}
								iconOnly={false}
								buttonFunction={handleDownloadClick}
								buttonIcon={mdiFileDownloadOutline}
								variant="secondary"
							>
								Download
							</FunctionButton>
						</div>
						<p className="text-center text-sm text-stone mt-3">
							Downloads as a .solum file you can import later
						</p>
					</div>
				</div>
			</div>
			<div ref={bottomRef}></div>
		</div>
	);
};

export default WrapUp;
