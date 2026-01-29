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
		<div className="bg-parchment py-8 md:py-12">
			<div className="container px-6 md:px-8">
				<div className="text-center mb-8">
					<h2 className="marcellus text-2xl md:text-3xl text-black mb-2">
						Finish & Export
					</h2>
					<p className="text-stone-dark">
						Your character is ready. Print or save for future use.
					</p>
				</div>

				<div className="max-w-md mx-auto">
					<div className="bg-white border-2 border-stone p-6">
						<div className="h-1 bg-gold -mt-6 -mx-6 mb-6" />
						<div className="flex flex-col sm:flex-row justify-center gap-4">
							<FunctionButton
								onClick={handlePrintClick}
								icon={mdiPrinterOutline}
								variant="secondary"
							>
								Print Character
							</FunctionButton>
							<FunctionButton
								onClick={handleDownloadClick}
								icon={mdiFileDownloadOutline}
								variant="primary"
							>
								Download .solum
							</FunctionButton>
						</div>
						<p className="text-center text-sm text-stone mt-4">
							Download as a .solum file to import later or share with your Dominus Ludi.
						</p>
					</div>
				</div>
			</div>
			<div ref={bottomRef}></div>
		</div>
	);
};

export default WrapUp;
