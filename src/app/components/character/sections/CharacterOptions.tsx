'use client';
import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Icon from '@mdi/react';
import {
	mdiArrowDownBoldCircleOutline,
	mdiUploadCircleOutline,
	mdiDiceMultiple,
	mdiFileUploadOutline,
} from '@mdi/js';
import { loadCharacter } from '@/lib/slices/characterSlice';
import { importCharacterFromFile } from '@/lib/characterPersistence';

interface CharacterOptionCardProps {
	title: string;
	description: string;
	icon: string;
	buttonText: string;
	onClick: () => void;
}

const CharacterOptionCard = ({
	title,
	description,
	icon,
	buttonText,
	onClick,
}: CharacterOptionCardProps) => {
	return (
		<div className="bg-white border-2 border-stone hover:border-oxblood transition-colors group">
			<div className="h-1 bg-oxblood" />
			<div className="p-6 text-center">
				<div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center border-2 border-stone group-hover:border-oxblood transition-colors">
					<Icon
						path={icon}
						size={1.25}
						className="text-stone group-hover:text-oxblood transition-colors"
					/>
				</div>
				<h3 className="marcellus text-xl text-black mb-2">{title}</h3>
				<p className="text-sm text-stone-dark mb-4">{description}</p>
				<button
					onClick={onClick}
					className="w-full py-3 px-6 bg-gold text-black marcellus uppercase tracking-widest text-sm font-bold hover:bg-brightgold transition-colors"
				>
					{buttonText}
				</button>
			</div>
		</div>
	);
};

const CharacterOptions = ({
	buttonFunction,
	onImportSuccess,
}: {
	buttonFunction: () => void;
	onImportSuccess?: () => void;
}) => {
	const bottomRef = useRef<null | HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const dispatch = useDispatch();
	const [importError, setImportError] = useState<string | null>(null);

	const scrollToBottom = () => {
		if (bottomRef) {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					bottomRef.current?.scrollIntoView({
						behavior: 'smooth',
						block: 'start',
					});
				});
			});
		}
	};

	const handleStartClick = () => {
		scrollToBottom();
	};

	const handleManageClick = () => {
		buttonFunction();
		scrollToBottom();
	};

	const handleGenerateClick = () => {
		buttonFunction();
		scrollToBottom();
	};

	const handleImportClick = () => {
		setImportError(null);
		fileInputRef.current?.click();
	};

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			const character = await importCharacterFromFile(file);
			dispatch(loadCharacter(character));
			setImportError(null);

			// Notify parent and scroll
			if (onImportSuccess) {
				onImportSuccess();
			}
			buttonFunction();
			scrollToBottom();
		} catch (err) {
			setImportError(err instanceof Error ? err.message : 'Failed to import character');
		}

		// Reset file input so same file can be selected again
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	return (
		<section className="bg-parchment py-8 md:py-12">
			<div className="container px-6 md:px-8">
				<div className="text-center mb-8">
					<h2 className="marcellus text-2xl md:text-3xl text-black mb-2">
						Choose Your Path
					</h2>
					<p className="text-stone-dark">
						Start fresh, continue an existing character, or let fate decide.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
					<CharacterOptionCard
						title="New Character"
						description="Build a practitioner from scratch, step by step."
						icon={mdiArrowDownBoldCircleOutline}
						buttonText="Start"
						onClick={handleStartClick}
					/>
					<CharacterOptionCard
						title="Manage Character"
						description="Continue working on an existing character."
						icon={mdiUploadCircleOutline}
						buttonText="Manage"
						onClick={handleManageClick}
					/>
					<CharacterOptionCard
						title="Import Character"
						description="Load a character from a .persona file."
						icon={mdiFileUploadOutline}
						buttonText="Import"
						onClick={handleImportClick}
					/>
					<CharacterOptionCard
						title="Generate Character"
						description="Roll the dice and let fate guide your creation."
						icon={mdiDiceMultiple}
						buttonText="Generate"
						onClick={handleGenerateClick}
					/>
				</div>

				{/* Hidden file input */}
				<input
					ref={fileInputRef}
					type="file"
					accept=".persona,.solum,.json"
					onChange={handleFileSelect}
					className="hidden"
				/>

				{/* Error message */}
				{importError && (
					<div className="mt-6 max-w-md mx-auto p-4 bg-oxblood/10 border border-oxblood text-oxblood text-center text-sm">
						{importError}
					</div>
				)}
			</div>
			<div ref={bottomRef}></div>
		</section>
	);
};

export default CharacterOptions;
