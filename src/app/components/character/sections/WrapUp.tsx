/**
 * WrapUp.tsx
 *
 * The final section of the Character Manager wizard, shown after all other sections
 * have been completed. It presents two actions for finishing the character:
 *
 *   1. "Print Character" — calls `window.print()`, which hides all screen-only
 *      elements and reveals the print-only `CharacterSheet` component (rendered in
 *      Sections.tsx) that produces a clean US Letter character sheet.
 *
 *   2. "Download .persona" — calls `exportCharacterToFile(character)` from
 *      `characterPersistence.ts`, which serializes the full Redux CharacterState to
 *      JSON and triggers a browser download as a `.persona` file. This file can later
 *      be imported via CharacterOptions or CharacterRoster to restore the character.
 *
 * The component reads character state directly from Redux (using `useSelector`) so it
 * always has the current data at the moment of export without needing props.
 *
 * The section uses the same parchment background as CharacterOptions for a visual
 * bookend — the wizard starts and ends with a parchment panel between white content
 * sections.
 *
 * Used by:
 *   - Sections.tsx (tenth and final wizard section, unlocked after ChooseAnimalCompanion)
 */
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
								Download .persona
							</FunctionButton>
						</div>
						<p className="text-center text-sm text-stone mt-4">
							Download as a .persona file to import later or share with your Dominus Ludi.
						</p>
					</div>
				</div>
			</div>
			<div ref={bottomRef}></div>
		</div>
	);
};

export default WrapUp;
