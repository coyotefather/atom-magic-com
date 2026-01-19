'use client';
import { LogEntry } from '@/lib/adventure-log-data';
import LogEntryCard from './LogEntryCard';

interface LogEntryListProps {
	entries: LogEntry[];
	onToggleKeyEvent: (id: string) => void;
	onDelete: (id: string) => void;
}

const LogEntryList = ({ entries, onToggleKeyEvent, onDelete }: LogEntryListProps) => {
	if (entries.length === 0) {
		return (
			<div className="bg-parchment border-2 border-stone p-6 text-center">
				<p className="text-sm text-stone">
					No entries yet. Add rolls, actions, or notes using the form above.
				</p>
			</div>
		);
	}

	// Sort entries by timestamp, most recent first
	const sortedEntries = [...entries].sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
	);

	return (
		<div className="space-y-2">
			{sortedEntries.map(entry => (
				<LogEntryCard
					key={entry.id}
					entry={entry}
					onToggleKeyEvent={onToggleKeyEvent}
					onDelete={onDelete}
				/>
			))}
		</div>
	);
};

export default LogEntryList;
