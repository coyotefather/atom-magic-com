'use client';
import Icon from '@mdi/react';
import { mdiDiceMultiple, mdiLightningBolt, mdiNoteText, mdiStar, mdiStarOutline, mdiClose } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';
import {
	LogEntry,
	formatTimestamp,
	formatDiceNotation,
	getNoteCategoryLabel,
	getNoteCategoryColor,
} from '@/lib/adventure-log-data';

interface LogEntryCardProps {
	entry: LogEntry;
	onToggleKeyEvent: (id: string) => void;
	onDelete: (id: string) => void;
}

const LogEntryCard = ({ entry, onToggleKeyEvent, onDelete }: LogEntryCardProps) => {
	const getEntryIcon = () => {
		switch (entry.type) {
			case 'roll':
				return mdiDiceMultiple;
			case 'action':
				return mdiLightningBolt;
			case 'note':
				return mdiNoteText;
		}
	};

	const getEntryColor = () => {
		switch (entry.type) {
			case 'roll':
				return 'border-l-gold';
			case 'action':
				return 'border-l-bronze';
			case 'note':
				return 'border-l-laurel';
		}
	};

	const getIconColor = () => {
		switch (entry.type) {
			case 'roll':
				return 'text-gold';
			case 'action':
				return 'text-bronze';
			case 'note':
				return 'text-laurel';
		}
	};

	return (
		<div
			className={`group bg-white border-2 border-stone/30 border-l-4 ${getEntryColor()} ${
				entry.isKeyEvent ? 'ring-2 ring-gold/30' : ''
			}`}
		>
			<div className="p-3">
				<div className="flex items-start gap-3">
					{/* Icon */}
					<div className={`mt-0.5 ${getIconColor()}`}>
						<Icon path={getEntryIcon()} size={0.75} />
					</div>

					{/* Content */}
					<div className="flex-1 min-w-0">
						{/* Header row */}
						<div className="flex items-center gap-2 text-xs text-stone mb-1">
							<span>{formatTimestamp(entry.timestamp)}</span>
							{entry.characterName && (
								<>
									<span>·</span>
									<span className="font-semibold text-black">{entry.characterName}</span>
								</>
							)}
							{entry.type === 'note' && entry.category && (
								<span className={`px-1.5 py-0.5 text-xs ${getNoteCategoryColor(entry.category)}`}>
									{getNoteCategoryLabel(entry.category)}
								</span>
							)}
						</div>

						{/* Entry content */}
						{entry.type === 'roll' && (
							<div>
								<div className="flex items-center gap-2">
									<span className="font-mono text-sm text-stone">
										{formatDiceNotation(entry.numDice, entry.dieType, entry.modifier)}
									</span>
									<span className="marcellus text-xl text-black">{entry.total}</span>
								</div>
								{entry.context && (
									<div className="text-sm text-stone mt-1">{entry.context}</div>
								)}
								<div className="flex flex-wrap gap-1 mt-1">
									{entry.rolls.map((roll, idx) => (
										<span
											key={idx}
											className="px-1.5 py-0.5 text-xs bg-stone/10 text-stone font-mono"
										>
											{roll}
										</span>
									))}
								</div>
							</div>
						)}

						{entry.type === 'action' && (
							<div className="text-sm text-black">{entry.description}</div>
						)}

						{entry.type === 'note' && (
							<div className="text-sm text-black whitespace-pre-wrap">{entry.content}</div>
						)}
					</div>

					{/* Actions */}
					<div className="flex items-center gap-1">
						<FunctionButton
							variant="toggle"
							size="sm"
							onClick={() => onToggleKeyEvent(entry.id)}
							icon={entry.isKeyEvent ? mdiStar : mdiStarOutline}
							isActive={entry.isKeyEvent}
							title={entry.isKeyEvent ? 'Remove from key events' : 'Mark as key event'}
							className={entry.isKeyEvent ? '' : 'border-0 text-stone/50 hover:text-gold'}
						/>
						<FunctionButton
							variant="ghost"
							size="sm"
							onClick={() => onDelete(entry.id)}
							icon={mdiClose}
							title="Delete entry"
							className="text-stone/50 hover:text-oxblood opacity-0 group-hover:opacity-100"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LogEntryCard;
