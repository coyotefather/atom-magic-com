'use client';
import { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiAccountGroup, mdiPlus, mdiClose } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';
import { getRoster, CharacterSummary } from '@/lib/characterPersistence';

interface PartyRosterProps {
	partyCharacterIds: string[];
	onAdd: (characterId: string) => void;
	onRemove: (characterId: string) => void;
}

const PartyRoster = ({ partyCharacterIds, onAdd, onRemove }: PartyRosterProps) => {
	const [allCharacters, setAllCharacters] = useState<CharacterSummary[]>([]);
	const [selectedCharacterId, setSelectedCharacterId] = useState('');

	useEffect(() => {
		const roster = getRoster();
		setAllCharacters(roster.characters);
	}, []);

	const partyMembers = allCharacters.filter(c => partyCharacterIds.includes(c.id));
	const availableToAdd = allCharacters.filter(c => !partyCharacterIds.includes(c.id));

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<Icon path={mdiAccountGroup} size={1} className="text-laurel" />
				<h2 className="marcellus text-xl text-black">Party Roster</h2>
			</div>

			{partyMembers.length === 0 ? (
				<p className="text-sm text-stone py-2">
					No party members added yet.
				</p>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{partyMembers.map(character => (
						<div
							key={character.id}
							className="bg-white border-2 border-stone p-3 flex items-start justify-between gap-2"
						>
							<div className="flex-1 min-w-0">
								<p className="marcellus text-base text-black truncate">
									{character.name || 'Unnamed'}
								</p>
								{(character.culture || character.path) && (
									<p className="text-xs text-stone mt-0.5 truncate">
										{[character.culture, character.path].filter(Boolean).join(' · ')}
									</p>
								)}
								<div className="flex gap-3 mt-1.5 text-xs text-stone">
									<span>Phys {character.physicalShield}</span>
									<span>Psyc {character.psychicShield}</span>
									{character.armorCapacity > 0 && (
										<span>Armor {character.armorCapacity}</span>
									)}
								</div>
							</div>
							<FunctionButton
								variant="ghost"
								size="sm"
								onClick={() => onRemove(character.id)}
								icon={mdiClose}
								title="Remove from party"
								className="text-stone hover:text-oxblood flex-shrink-0"
							/>
						</div>
					))}
				</div>
			)}

			{availableToAdd.length > 0 && (
				<div className="flex items-center gap-3">
					<select
						id="add-character-select"
						value={selectedCharacterId}
						className="flex-1 px-3 py-2 border-2 border-stone bg-white text-sm focus:border-bronze focus:outline-none"
						onChange={e => {
							if (e.target.value) {
								onAdd(e.target.value);
								setSelectedCharacterId('');
							}
						}}
					>
						<option value="" disabled>Add a character to the party...</option>
						{availableToAdd.map(c => (
							<option key={c.id} value={c.id}>
								{c.name || 'Unnamed'}
								{c.culture ? ` (${c.culture})` : ''}
							</option>
						))}
					</select>
					<Icon path={mdiPlus} size={0.8} className="text-stone flex-shrink-0" />
				</div>
			)}

			{allCharacters.length === 0 && (
				<p className="text-xs text-stone/70">
					No saved characters found. Create characters in the{' '}
					<a href="/character" className="text-bronze hover:underline">
						Character Manager
					</a>
					.
				</p>
			)}
		</div>
	);
};

export default PartyRoster;
