'use client';
import { useState, useEffect, useCallback } from 'react';
import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js';
import SessionRoster from './SessionRoster';
import EntryComposer from './EntryComposer';
import LogEntryList from './LogEntryList';
import SessionExport from './SessionExport';
import { useRollContext } from '@/lib/RollContext';
import {
	Session,
	SessionSummary,
	LogEntry,
	RollLogEntry,
	ActionLogEntry,
	NoteLogEntry,
	createNewSession,
	createRollEntry,
} from '@/lib/adventure-log-data';
import {
	getSessionRoster,
	getSessionById,
	saveSessionById,
	deleteSessionById,
	setActiveSession,
} from '@/lib/sessionPersistence';

const AdventureLogBuilder = () => {
	const [sessions, setSessions] = useState<SessionSummary[]>([]);
	const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
	const [currentSession, setCurrentSession] = useState<Session | null>(null);
	const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(true);

	const { onRollCaptured } = useRollContext();

	// Load roster from localStorage on mount
	useEffect(() => {
		const roster = getSessionRoster();
		setSessions(roster.sessions);
		setActiveSessionId(roster.activeSessionId);

		// Load active session if one exists
		if (roster.activeSessionId) {
			const session = getSessionById(roster.activeSessionId);
			if (session) {
				setCurrentSession(session);
			}
		}
	}, []);

	// Subscribe to roll broadcasts from Dice Roller
	useEffect(() => {
		if (!autoCaptureEnabled || !currentSession) return;

		const unsubscribe = onRollCaptured((roll) => {
			// Convert RollResult to RollLogEntry
			const entry = createRollEntry(
				{
					dieType: roll.dieType,
					numDice: roll.numDice,
					modifier: roll.modifier,
					rolls: roll.rolls,
					total: roll.total,
				},
				{
					// No character info for auto-captured rolls
					// User can edit the entry later if needed
				}
			);

			// Add to current session
			addEntryToSession(entry);
		});

		return unsubscribe;
	}, [autoCaptureEnabled, currentSession, onRollCaptured]);

	// Save session when it changes
	const saveCurrentSession = useCallback((session: Session) => {
		saveSessionById(session.id, session);
		// Update local state
		setSessions(prev => {
			const roster = getSessionRoster();
			return roster.sessions;
		});
	}, []);

	// Add entry to current session
	const addEntryToSession = useCallback((entry: RollLogEntry | ActionLogEntry | NoteLogEntry) => {
		setCurrentSession(prev => {
			if (!prev) return prev;
			const updated = {
				...prev,
				entries: [...prev.entries, entry],
			};
			saveSessionById(updated.id, updated);
			// Refresh sessions list
			setSessions(getSessionRoster().sessions);
			return updated;
		});
	}, []);

	// Create new session
	const handleNewSession = () => {
		const newSession = createNewSession();
		setCurrentSession(newSession);
		setActiveSessionId(newSession.id);
		setActiveSession(newSession.id);
		saveSessionById(newSession.id, newSession);
		setSessions(prev => [...prev, {
			id: newSession.id,
			name: newSession.name,
			entryCount: 0,
			keyEventCount: 0,
			lastModified: newSession.lastModified,
		}]);
	};

	// Select an existing session
	const handleSelectSession = (id: string) => {
		const session = getSessionById(id);
		if (session) {
			setCurrentSession(session);
			setActiveSessionId(id);
			setActiveSession(id);
		}
	};

	// Delete a session
	const handleDeleteSession = (id: string) => {
		deleteSessionById(id);
		setSessions(prev => prev.filter(s => s.id !== id));

		if (activeSessionId === id) {
			setCurrentSession(null);
			setActiveSessionId(null);
		}
	};

	// Update session name
	const handleNameChange = (name: string) => {
		if (!currentSession) return;
		const updated = { ...currentSession, name };
		setCurrentSession(updated);
		saveCurrentSession(updated);
	};

	// Toggle key event status
	const handleToggleKeyEvent = (entryId: string) => {
		if (!currentSession) return;

		const updatedEntries = currentSession.entries.map(entry =>
			entry.id === entryId
				? { ...entry, isKeyEvent: !entry.isKeyEvent }
				: entry
		);

		const updated = { ...currentSession, entries: updatedEntries };
		setCurrentSession(updated);
		saveCurrentSession(updated);
	};

	// Delete an entry
	const handleDeleteEntry = (entryId: string) => {
		if (!currentSession) return;

		const updatedEntries = currentSession.entries.filter(entry => entry.id !== entryId);
		const updated = { ...currentSession, entries: updatedEntries };
		setCurrentSession(updated);
		saveCurrentSession(updated);
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
			{/* Left sidebar - Session Roster */}
			<aside className="lg:col-span-1">
				<SessionRoster
					sessions={sessions}
					activeSessionId={activeSessionId}
					onSelect={handleSelectSession}
					onDelete={handleDeleteSession}
					onNew={handleNewSession}
				/>
			</aside>

			{/* Main content - Session Editor */}
			<main className="lg:col-span-3">
				{currentSession ? (
					<div className="space-y-6">
						{/* Session header */}
						<div className="bg-parchment border-2 border-stone p-4">
							<label className="block text-xs text-stone uppercase tracking-wider mb-2">
								Session Name
							</label>
							<input
								type="text"
								value={currentSession.name}
								onChange={e => handleNameChange(e.target.value)}
								className="w-full px-4 py-2 border-2 border-stone bg-white marcellus text-xl focus:border-bronze focus:outline-none"
								placeholder="Enter session name..."
							/>
						</div>

						{/* Entry composer */}
						<EntryComposer
							onAddEntry={addEntryToSession}
							autoCaptureEnabled={autoCaptureEnabled}
							onAutoCaptureToggle={setAutoCaptureEnabled}
						/>

						{/* Entry list */}
						<div>
							<h3 className="marcellus text-lg text-black mb-3">
								Log Entries ({currentSession.entries.length})
							</h3>
							<LogEntryList
								entries={currentSession.entries}
								onToggleKeyEvent={handleToggleKeyEvent}
								onDelete={handleDeleteEntry}
							/>
						</div>

						{/* Export */}
						<SessionExport session={currentSession} />
					</div>
				) : (
					<div className="bg-parchment border-2 border-stone p-12 text-center">
						<Icon
							path={mdiPlus}
							size={3}
							className="mx-auto text-stone/30 mb-4"
						/>
						<p className="text-stone mb-4">
							Select an existing session or create a new one to get started.
						</p>
						<button
							onClick={handleNewSession}
							className="px-6 py-3 bg-bronze text-white marcellus uppercase tracking-wider hover:bg-gold transition-colors"
						>
							New Session
						</button>
					</div>
				)}
			</main>
		</div>
	);
};

export default AdventureLogBuilder;
