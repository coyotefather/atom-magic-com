'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@mdi/react';
import {
	mdiAccountPlus,
	mdiAccountEdit,
	mdiDelete,
	mdiFileImport,
	mdiClockOutline,
} from '@mdi/js';
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

	const formatDate = (isoString: string) => {
		const date = new Date(isoString);
		return date.toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
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
					<button
						onClick={handleImportClick}
						className="inline-flex items-center gap-2 px-4 py-2 border-2 border-stone text-stone hover:border-gold hover:text-gold transition-colors marcellus text-sm uppercase tracking-wider"
					>
						<Icon path={mdiFileImport} size={0.75} />
						Import
					</button>
					<button
						onClick={handleNewCharacter}
						className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-black hover:bg-brightgold transition-colors marcellus text-sm uppercase tracking-wider"
					>
						<Icon path={mdiAccountPlus} size={0.75} />
						New Character
					</button>
					<input
						ref={fileInputRef}
						type="file"
						accept=".solum"
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
				<div className="space-y-2">
					{characters.map((char) => (
						<div
							key={char.id}
							className={`flex items-center justify-between p-4 border-2 transition-colors ${
								activeId === char.id
									? 'border-gold bg-gold/5'
									: 'border-stone/30 hover:border-stone'
							}`}
						>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-3">
									<h3 className="marcellus text-lg truncate">
										{char.name || 'Unnamed Character'}
									</h3>
									{activeId === char.id && (
										<span className="px-2 py-0.5 text-xs bg-gold/20 text-gold marcellus uppercase">
											Active
										</span>
									)}
								</div>
								<div className="flex items-center gap-4 text-sm text-stone mt-1">
									{char.path && <span>{char.path}</span>}
									{char.culture && <span>{char.culture}</span>}
									<span className="flex items-center gap-1 text-stone/60">
										<Icon path={mdiClockOutline} size={0.5} />
										{formatDate(char.lastModified)}
									</span>
								</div>
							</div>

							<div className="flex items-center gap-2 ml-4">
								{activeId !== char.id && (
									<button
										onClick={() => handleSelectCharacter(char.id)}
										className="inline-flex items-center gap-1 px-3 py-1.5 border-2 border-gold text-gold hover:bg-gold hover:text-black transition-colors text-sm marcellus"
									>
										<Icon path={mdiAccountEdit} size={0.625} />
										Edit
									</button>
								)}
								{deleteConfirm === char.id ? (
									<div className="flex items-center gap-2">
										<button
											onClick={() => handleDeleteCharacter(char.id)}
											className="px-3 py-1.5 bg-oxblood text-white text-sm marcellus"
										>
											Confirm
										</button>
										<button
											onClick={() => setDeleteConfirm(null)}
											className="px-3 py-1.5 border-2 border-stone text-stone text-sm marcellus"
										>
											Cancel
										</button>
									</div>
								) : (
									<button
										onClick={() => setDeleteConfirm(char.id)}
										className="p-1.5 text-stone hover:text-oxblood transition-colors"
										title="Delete character"
									>
										<Icon path={mdiDelete} size={0.75} />
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default CharacterRoster;
