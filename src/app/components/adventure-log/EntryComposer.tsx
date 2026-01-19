'use client';
import { useState } from 'react';
import Icon from '@mdi/react';
import { mdiDiceMultiple, mdiLightningBolt, mdiNoteText, mdiPlus } from '@mdi/js';
import CharacterPicker from './CharacterPicker';
import {
	DieType,
	NoteCategory,
	NOTE_CATEGORIES,
	RollLogEntry,
	ActionLogEntry,
	NoteLogEntry,
	createRollEntry,
	createActionEntry,
	createNoteEntry,
} from '@/lib/adventure-log-data';

type TabType = 'roll' | 'action' | 'note';

interface EntryComposerProps {
	onAddEntry: (entry: RollLogEntry | ActionLogEntry | NoteLogEntry) => void;
	autoCaptureEnabled: boolean;
	onAutoCaptureToggle: (enabled: boolean) => void;
}

const DIE_TYPES: DieType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

const EntryComposer = ({
	onAddEntry,
	autoCaptureEnabled,
	onAutoCaptureToggle,
}: EntryComposerProps) => {
	const [activeTab, setActiveTab] = useState<TabType>('action');

	// Roll form state
	const [rollCharacter, setRollCharacter] = useState<{ characterId?: string; characterName?: string }>({});
	const [rollDieType, setRollDieType] = useState<DieType>('d20');
	const [rollNumDice, setRollNumDice] = useState(1);
	const [rollModifier, setRollModifier] = useState(0);
	const [rollContext, setRollContext] = useState('');

	// Action form state
	const [actionCharacter, setActionCharacter] = useState<{ characterId?: string; characterName?: string }>({});
	const [actionDescription, setActionDescription] = useState('');

	// Note form state
	const [noteContent, setNoteContent] = useState('');
	const [noteCategory, setNoteCategory] = useState<NoteCategory | ''>('');

	const handleAddRoll = () => {
		// Generate rolls
		const dieMax = parseInt(rollDieType.slice(1));
		const rolls: number[] = [];
		for (let i = 0; i < rollNumDice; i++) {
			rolls.push(Math.floor(Math.random() * dieMax) + 1);
		}
		const total = rolls.reduce((sum, r) => sum + r, 0) + rollModifier;

		const entry = createRollEntry(
			{
				dieType: rollDieType,
				numDice: rollNumDice,
				modifier: rollModifier,
				rolls,
				total,
			},
			{
				characterId: rollCharacter.characterId,
				characterName: rollCharacter.characterName,
				context: rollContext || undefined,
			}
		);

		onAddEntry(entry);

		// Reset form
		setRollContext('');
	};

	const handleAddAction = () => {
		if (!actionDescription.trim()) return;

		const entry = createActionEntry(actionDescription.trim(), {
			characterId: actionCharacter.characterId,
			characterName: actionCharacter.characterName,
		});

		onAddEntry(entry);

		// Reset form
		setActionDescription('');
	};

	const handleAddNote = () => {
		if (!noteContent.trim()) return;

		const entry = createNoteEntry(noteContent.trim(), {
			category: noteCategory || undefined,
		});

		onAddEntry(entry);

		// Reset form
		setNoteContent('');
		setNoteCategory('');
	};

	const tabs: { type: TabType; label: string; icon: string }[] = [
		{ type: 'roll', label: 'Roll', icon: mdiDiceMultiple },
		{ type: 'action', label: 'Action', icon: mdiLightningBolt },
		{ type: 'note', label: 'Note', icon: mdiNoteText },
	];

	return (
		<div className="bg-parchment border-2 border-stone">
			{/* Tab headers */}
			<div className="flex border-b-2 border-stone">
				{tabs.map(tab => (
					<button
						key={tab.type}
						onClick={() => setActiveTab(tab.type)}
						className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${
							activeTab === tab.type
								? 'bg-white text-black border-b-2 border-bronze -mb-[2px]'
								: 'text-stone hover:text-black'
						}`}
					>
						<Icon path={tab.icon} size={0.75} />
						{tab.label}
					</button>
				))}
			</div>

			{/* Tab content */}
			<div className="p-4">
				{/* Roll tab */}
				{activeTab === 'roll' && (
					<div className="space-y-4">
						{/* Auto-capture toggle */}
						<div className="flex items-center justify-between p-3 bg-white border border-stone/30">
							<div>
								<div className="text-sm font-semibold text-black">Auto-capture from Dice Roller</div>
								<div className="text-xs text-stone">
									Rolls made in the Dice Roller will appear here automatically
								</div>
							</div>
							<button
								onClick={() => onAutoCaptureToggle(!autoCaptureEnabled)}
								className={`relative w-12 h-6 rounded-full transition-colors ${
									autoCaptureEnabled ? 'bg-bronze' : 'bg-stone/30'
								}`}
							>
								<div
									className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
										autoCaptureEnabled ? 'left-7' : 'left-1'
									}`}
								/>
							</button>
						</div>

						<div className="text-xs text-stone text-center">- or add a manual roll -</div>

						<CharacterPicker
							value={rollCharacter}
							onChange={setRollCharacter}
							placeholder="Who is rolling?"
						/>

						<div className="grid grid-cols-3 gap-2">
							<div>
								<label className="block text-xs text-stone mb-1">Dice</label>
								<select
									value={rollNumDice}
									onChange={e => setRollNumDice(parseInt(e.target.value))}
									className="w-full px-3 py-2 border-2 border-stone bg-white text-sm focus:border-bronze focus:outline-none"
								>
									{[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
										<option key={n} value={n}>{n}</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-xs text-stone mb-1">Type</label>
								<select
									value={rollDieType}
									onChange={e => setRollDieType(e.target.value as DieType)}
									className="w-full px-3 py-2 border-2 border-stone bg-white text-sm focus:border-bronze focus:outline-none"
								>
									{DIE_TYPES.map(d => (
										<option key={d} value={d}>{d}</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-xs text-stone mb-1">Modifier</label>
								<input
									type="number"
									value={rollModifier}
									onChange={e => setRollModifier(parseInt(e.target.value) || 0)}
									className="w-full px-3 py-2 border-2 border-stone bg-white text-sm focus:border-bronze focus:outline-none"
								/>
							</div>
						</div>

						<input
							type="text"
							value={rollContext}
							onChange={e => setRollContext(e.target.value)}
							placeholder="What is this roll for? (Attack, Perception, etc.)"
							className="w-full px-3 py-2 border-2 border-stone bg-white text-sm focus:border-bronze focus:outline-none"
						/>

						<button
							onClick={handleAddRoll}
							className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gold text-black marcellus uppercase tracking-wider hover:bg-brightgold transition-colors"
						>
							<Icon path={mdiDiceMultiple} size={0.75} />
							Roll & Add
						</button>
					</div>
				)}

				{/* Action tab */}
				{activeTab === 'action' && (
					<div className="space-y-4">
						<CharacterPicker
							value={actionCharacter}
							onChange={setActionCharacter}
							placeholder="Who is acting?"
						/>

						<textarea
							value={actionDescription}
							onChange={e => setActionDescription(e.target.value)}
							placeholder="Describe the action... (e.g., 'Picked the lock on the merchant's door')"
							rows={3}
							className="w-full px-3 py-2 border-2 border-stone bg-white text-sm focus:border-bronze focus:outline-none resize-none"
						/>

						<button
							onClick={handleAddAction}
							disabled={!actionDescription.trim()}
							className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-bronze text-white marcellus uppercase tracking-wider hover:bg-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							<Icon path={mdiPlus} size={0.75} />
							Add Action
						</button>
					</div>
				)}

				{/* Note tab */}
				{activeTab === 'note' && (
					<div className="space-y-4">
						<div>
							<label className="block text-xs text-stone mb-1">Category (optional)</label>
							<select
								value={noteCategory}
								onChange={e => setNoteCategory(e.target.value as NoteCategory | '')}
								className="w-full px-3 py-2 border-2 border-stone bg-white text-sm focus:border-bronze focus:outline-none"
							>
								<option value="">No category</option>
								{NOTE_CATEGORIES.map(cat => (
									<option key={cat.value} value={cat.value}>{cat.label}</option>
								))}
							</select>
						</div>

						<textarea
							value={noteContent}
							onChange={e => setNoteContent(e.target.value)}
							placeholder="Write your note... (story beat, NPC encounter, discovery, etc.)"
							rows={4}
							className="w-full px-3 py-2 border-2 border-stone bg-white text-sm focus:border-bronze focus:outline-none resize-none"
						/>

						<button
							onClick={handleAddNote}
							disabled={!noteContent.trim()}
							className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-laurel text-white marcellus uppercase tracking-wider hover:bg-laurel/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							<Icon path={mdiPlus} size={0.75} />
							Add Note
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default EntryComposer;
