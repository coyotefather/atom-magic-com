/**
 * CharacterRoster.tsx
 *
 * A management panel that lists all saved characters stored in localStorage. This
 * is the first thing a returning user sees when visiting the Character Manager — it
 * lets them pick up where they left off rather than always starting a new character.
 *
 * Responsibilities:
 *   - On mount, runs `migrateToMultiCharacter()` to upgrade any legacy single-character
 *     localStorage data to the newer multi-character roster format.
 *   - Renders a `CharacterSummaryCard` for each saved character, with an "Active" badge
 *     on whichever character is currently loaded into Redux.
 *   - Selecting a character loads it into Redux via `loadCharacter()` and calls the
 *     `onCharacterSelected` callback so the parent can switch to the editor view.
 *   - "New Character" clears Redux state, assigns a fresh ID, and calls `onNewCharacter`.
 *   - Delete requires a two-step confirmation (first click shows Confirm/Cancel) to
 *     prevent accidental deletion.
 *   - Share button opens a `ShareCharacterModal` for the selected character.
 *   - Import button accepts `.persona` or `.solum` files via a hidden file input,
 *     parses them with `importCharacterFromFile()`, and adds them to the roster.
 *
 * Props:
 *   - onCharacterSelected(characterId): called after loading a character from the roster
 *   - onNewCharacter(): called after initializing a blank new character
 *
 * Used by:
 *   - Sections.tsx (shown when `showRoster` is true, before the editor sections appear)
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import {
	mdiAccountPlus,
	mdiAccountEdit,
	mdiDelete,
	mdiFileImport,
	mdiShareVariant,
} from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';
import {
	getRoster,
	getCharacterById,
	deleteCharacterById,
	setActiveCharacter,
	createNewCharacterId,
	migrateToMultiCharacter,
	importCharacterFromFile,
	saveCharacterById,
	CharacterSummary,
} from '@/lib/characterPersistence';
import { useAppDispatch } from '@/lib/hooks';
import { loadCharacter, clearCharacter } from '@/lib/slices/characterSlice';
import CharacterSummaryCard from './CharacterSummaryCard';
import ShareCharacterModal from './ShareCharacterModal';
import { CharacterState } from '@/lib/slices/characterSlice';

interface CharacterRosterProps {
	onCharacterSelected: (characterId: string) => void;
	onNewCharacter: () => void;
}

const CharacterRoster = ({ onCharacterSelected, onNewCharacter }: CharacterRosterProps) => {
	const dispatch = useAppDispatch();
	const [characters, setCharacters] = useState<CharacterSummary[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
	const [shareCharacter, setShareCharacter] = useState<CharacterState | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Load roster on mount
	useEffect(() => {
		// First, try to migrate from old single-character storage
		migrateToMultiCharacter();

		// Then load the roster
		const roster = getRoster();
		setCharacters(roster.characters);
		setActiveId(roster.activeCharacterId);
		setIsLoading(false);
	}, []);

	const handleSelectCharacter = (id: string) => {
		const character = getCharacterById(id);
		if (character) {
			dispatch(loadCharacter(character));
			setActiveCharacter(id);
			setActiveId(id);
			onCharacterSelected(id);
		}
	};

	const handleNewCharacter = () => {
		const id = createNewCharacterId();
		dispatch(clearCharacter());
		setActiveCharacter(id);
		setActiveId(id);
		onNewCharacter();
	};

	const handleDeleteCharacter = (id: string) => {
		deleteCharacterById(id);
		setCharacters((prev) => prev.filter((c) => c.id !== id));
		setDeleteConfirm(null);

		// If this was the active character, clear it
		if (activeId === id) {
			setActiveId(null);
			dispatch(clearCharacter());
		}
	};

	const handleImportClick = () => {
		fileInputRef.current?.click();
	};

	const handleShareCharacter = (id: string, e?: React.MouseEvent) => {
		e?.stopPropagation();
		const character = getCharacterById(id);
		if (character) {
			setShareCharacter(character);
		}
	};

	const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			const character = await importCharacterFromFile(file);
			const id = createNewCharacterId();
			saveCharacterById(id, character);
			dispatch(loadCharacter(character));
			setActiveCharacter(id);

			// Refresh roster
			const roster = getRoster();
			setCharacters(roster.characters);
			setActiveId(id);
			onCharacterSelected(id);
		} catch (err) {
			console.error('Failed to import character:', err);
			alert(err instanceof Error ? err.message : 'Failed to import character');
		}

		// Reset input
		e.target.value = '';
	};

	if (isLoading) {
		return (
			<div className="p-8 text-center">
				<p className="text-stone">Loading characters...</p>
			</div>
		);
	}

	return (
		<div className="bg-white border-2 border-stone p-6 mb-8">
			<div className="flex items-center justify-between mb-6">
				<h2 className="marcellus text-xl">Your Characters</h2>
				<div className="flex gap-2">
					<FunctionButton
						variant="secondary"
						size="sm"
						onClick={handleImportClick}
						icon={mdiFileImport}
						className="border-stone text-stone hover:border-gold hover:text-gold"
					>
						Import
					</FunctionButton>
					<FunctionButton
						variant="primary"
						size="sm"
						onClick={handleNewCharacter}
						icon={mdiAccountPlus}
					>
						New Character
					</FunctionButton>
					<input
						ref={fileInputRef}
						type="file"
						accept=".persona,.solum"
						onChange={handleFileImport}
						className="hidden"
					/>
				</div>
			</div>

			{characters.length === 0 ? (
				<div className="text-center py-12 border-2 border-dashed border-stone/30">
					<p className="text-stone mb-2">No characters yet</p>
					<p className="text-stone/60 text-sm">
						Create a new character or import an existing one
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{characters.map((char) => (
						<div key={char.id} className="relative">
							<CharacterSummaryCard
								character={char}
								isActive={activeId === char.id}
								onClick={() => handleSelectCharacter(char.id)}
							/>
							{/* Action buttons overlay */}
							<div className="absolute top-4 right-4 flex items-center gap-2">
								<FunctionButton
									variant="ghost"
									size="sm"
									onClick={(e) => handleShareCharacter(char.id, e)}
									icon={mdiShareVariant}
									title="Share character"
									className="hover:text-gold"
								/>
								{activeId !== char.id && (
									<FunctionButton
										variant="secondary"
										size="sm"
										onClick={(e) => {
											e?.stopPropagation();
											handleSelectCharacter(char.id);
										}}
										icon={mdiAccountEdit}
									>
										Edit
									</FunctionButton>
								)}
								{deleteConfirm === char.id ? (
									<div className="flex items-center gap-2">
										<FunctionButton
											variant="danger"
											size="sm"
											onClick={(e) => {
												e?.stopPropagation();
												handleDeleteCharacter(char.id);
											}}
										>
											Confirm
										</FunctionButton>
										<FunctionButton
											variant="secondary"
											size="sm"
											onClick={(e) => {
												e?.stopPropagation();
												setDeleteConfirm(null);
											}}
											className="border-stone text-stone"
										>
											Cancel
										</FunctionButton>
									</div>
								) : (
									<FunctionButton
										variant="ghost"
										size="sm"
										onClick={(e) => {
											e?.stopPropagation();
											setDeleteConfirm(char.id);
										}}
										icon={mdiDelete}
										title="Delete character"
										className="hover:text-oxblood"
									/>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			{/* Share Modal */}
			{shareCharacter && (
				<ShareCharacterModal
					isOpen={!!shareCharacter}
					onClose={() => setShareCharacter(null)}
					character={shareCharacter}
				/>
			)}
		</div>
	);
};

export default CharacterRoster;
