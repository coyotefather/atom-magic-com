'use client';
import { useState, useEffect } from 'react';
import { getRoster, CharacterSummary } from '@/lib/characterPersistence';

interface CharacterPickerValue {
	characterId?: string;
	characterName?: string;
}

interface CharacterPickerProps {
	value: CharacterPickerValue;
	onChange: (value: CharacterPickerValue) => void;
	placeholder?: string;
}

const CharacterPicker = ({
	value,
	onChange,
	placeholder = 'Select character...',
}: CharacterPickerProps) => {
	const [characters, setCharacters] = useState<CharacterSummary[]>([]);
	const [isCustom, setIsCustom] = useState(false);
	const [customName, setCustomName] = useState('');

	// Load characters on mount
	useEffect(() => {
		const roster = getRoster();
		setCharacters(roster.characters);

		// Check if current value is custom (has name but no ID)
		if (value.characterName && !value.characterId) {
			setIsCustom(true);
			setCustomName(value.characterName);
		}
	}, [value.characterId, value.characterName]);

	const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedId = e.target.value;

		if (selectedId === 'custom') {
			setIsCustom(true);
			setCustomName('');
			onChange({ characterName: '' });
		} else if (selectedId === '') {
			setIsCustom(false);
			setCustomName('');
			onChange({});
		} else {
			setIsCustom(false);
			const character = characters.find(c => c.id === selectedId);
			if (character) {
				onChange({
					characterId: character.id,
					characterName: character.name,
				});
			}
		}
	};

	const handleCustomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const name = e.target.value;
		setCustomName(name);
		onChange({ characterName: name });
	};

	return (
		<div className="space-y-2">
			<select
				value={isCustom ? 'custom' : (value.characterId || '')}
				onChange={handleSelectChange}
				className="w-full px-3 py-2 border-2 border-stone bg-white text-sm focus:border-bronze focus:outline-none"
			>
				<option value="">{placeholder}</option>
				{characters.length > 0 && (
					<optgroup label="Saved Characters">
						{characters.map(char => (
							<option key={char.id} value={char.id}>
								{char.name || 'Unnamed'}
							</option>
						))}
					</optgroup>
				)}
				<option value="custom">Other (type name)...</option>
			</select>

			{isCustom && (
				<input
					type="text"
					value={customName}
					onChange={handleCustomNameChange}
					placeholder="Enter name (NPC, guest, etc.)"
					className="w-full px-3 py-2 border-2 border-stone bg-white text-sm focus:border-bronze focus:outline-none"
					autoFocus
				/>
			)}
		</div>
	);
};

export default CharacterPicker;
