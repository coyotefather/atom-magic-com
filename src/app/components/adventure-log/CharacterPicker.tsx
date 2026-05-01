/**
 * CharacterPicker.tsx
 *
 * A controlled form widget for selecting or entering a character name, used
 * in the Adventure Log's entry composer to attribute rolls and actions to a
 * specific character.
 *
 * Behaviour:
 *   - On mount, reads the user's saved character roster from localStorage via
 *     `getRoster()` and populates a `<select>` element.
 *   - Saved characters appear under an "optgroup" so they are visually separated
 *     from the "Other (type name)..." option.
 *   - Selecting a saved character emits `{ characterId, characterName }` via
 *     `onChange`.
 *   - Selecting "Other" reveals a free-text `<input>` for entering an NPC or
 *     guest player's name. Only `characterName` (no ID) is emitted in this case.
 *   - Selecting the empty/placeholder option emits `{}` (no character attached).
 *
 * The component detects on mount whether the current `value` is a custom-name
 * entry (has `characterName` but no `characterId`) and pre-selects "Other" with
 * the custom name pre-filled, so re-editing an existing entry shows the correct
 * state.
 *
 * Props:
 *   - `value`       — Current character selection (`{ characterId?, characterName? }`).
 *   - `onChange`    — Called with the new value whenever the selection changes.
 *   - `placeholder` — Optional select placeholder text (default: "Select character...").
 *
 * Used by:
 *   - src/app/components/adventure-log/EntryComposer.tsx (Roll and Action tabs)
 */

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
