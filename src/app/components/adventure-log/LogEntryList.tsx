/**
 * LogEntryList.tsx
 *
 * Renders the full list of log entries for the active session, sorted with the
 * most recent entry at the top (descending by `timestamp`). Each entry is
 * rendered as a `LogEntryCard`.
 *
 * When there are no entries, shows a plain empty-state message prompting the
 * user to add their first roll, action, or note.
 *
 * Sorting is done on a shallow copy of the entries array so that the original
 * session state (which stores entries in insertion order) is not mutated.
 *
 * Props:
 *   - `entries`          — The session's full entries array (unsorted).
 *   - `onToggleKeyEvent` — Forwarded to each `LogEntryCard`.
 *   - `onDelete`         — Forwarded to each `LogEntryCard`.
 *
 * Used by:
 *   - src/app/components/adventure-log/AdventureLogBuilder.tsx
 */

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
