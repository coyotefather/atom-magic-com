'use client';
import { useState } from 'react';
import Icon from '@mdi/react';
import { mdiLink, mdiLinkOff, mdiStar, mdiChevronDown, mdiChevronUp, mdiBookOpen } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';
import { SessionSummary, Session, formatFullTimestamp, getNoteCategoryLabel } from '@/lib/adventure-log-data';
import { getSessionById } from '@/lib/sessionPersistence';

interface SessionLinkerProps {
	linkedSessions: SessionSummary[];
	unlinkedSessions: SessionSummary[];
	onLink: (sessionId: string) => void;
	onUnlink: (sessionId: string) => void;
}

const SessionLinker = ({
	linkedSessions,
	unlinkedSessions,
	onLink,
	onUnlink,
}: SessionLinkerProps) => {
	const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

	const toggleExpand = (id: string) => {
		setExpandedSessionId(prev => prev === id ? null : id);
	};

	const getKeyEvents = (sessionId: string) => {
		const session = getSessionById(sessionId) as Session | null;
		if (!session) return [];
		return session.entries.filter(e => e.isKeyEvent);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<Icon path={mdiBookOpen} size={1} className="text-laurel" />
				<h2 className="marcellus text-xl text-black">Sessions</h2>
			</div>

			{/* Link a new session */}
			{unlinkedSessions.length > 0 && (
				<div className="flex items-center gap-3">
					<select
						className="flex-1 px-3 py-2 border-2 border-stone bg-white text-sm focus:border-bronze focus:outline-none"
						defaultValue=""
						onChange={e => {
							if (e.target.value) {
								onLink(e.target.value);
								e.target.value = '';
							}
						}}
					>
						<option value="" disabled>Link a session to this campaign...</option>
						{unlinkedSessions.map(s => (
							<option key={s.id} value={s.id}>
								{s.name || 'Unnamed Session'} — {formatFullTimestamp(s.lastModified)}
							</option>
						))}
					</select>
					<Icon path={mdiLink} size={0.8} className="text-stone flex-shrink-0" />
				</div>
			)}

			{unlinkedSessions.length === 0 && linkedSessions.length === 0 && (
				<p className="text-sm text-stone py-2">
					No sessions found. Create sessions in the{' '}
					<a href="/adventure-log" className="text-bronze hover:underline">
						Adventure Log
					</a>
					.
				</p>
			)}

			{/* Linked sessions */}
			{linkedSessions.length === 0 && unlinkedSessions.length > 0 && (
				<p className="text-sm text-stone py-2">
					No sessions linked yet. Select a session above to link it.
				</p>
			)}

			<div className="space-y-3">
				{linkedSessions.map(summary => {
					const isExpanded = expandedSessionId === summary.id;
					const keyEvents = isExpanded ? getKeyEvents(summary.id) : [];

					return (
						<div key={summary.id} className="bg-white border-2 border-stone">
							{/* Session card header */}
							<div className="p-4 flex items-start justify-between gap-3">
								<div className="flex-1 min-w-0">
									<h3 className="marcellus text-base text-black">
										{summary.name || 'Unnamed Session'}
									</h3>
									<div className="flex items-center gap-4 mt-1 text-xs text-stone">
										<span>
											{summary.entryCount} entr{summary.entryCount !== 1 ? 'ies' : 'y'}
										</span>
										{summary.keyEventCount > 0 && (
											<span className="flex items-center gap-1 text-gold">
												<Icon path={mdiStar} size={0.5} />
												{summary.keyEventCount} key
											</span>
										)}
										<span>{formatFullTimestamp(summary.lastModified)}</span>
									</div>
								</div>
								<div className="flex items-center gap-2 flex-shrink-0">
									{summary.keyEventCount > 0 && (
										<FunctionButton
											variant="ghost"
											size="sm"
											onClick={() => toggleExpand(summary.id)}
											icon={isExpanded ? mdiChevronUp : mdiChevronDown}
											title={isExpanded ? 'Collapse key events' : 'Show key events'}
										/>
									)}
									<FunctionButton
										variant="ghost"
										size="sm"
										onClick={() => onUnlink(summary.id)}
										icon={mdiLinkOff}
										title="Unlink from campaign"
										className="text-stone hover:text-oxblood"
									/>
								</div>
							</div>

							{/* Key events (expanded) */}
							{isExpanded && keyEvents.length > 0 && (
								<div className="border-t-2 border-stone/30 px-4 pb-4 pt-3 space-y-2">
									<p className="text-xs text-stone uppercase tracking-wider mb-2">Key Events</p>
									{keyEvents.map(entry => {
										let text = '';
										if (entry.type === 'action') {
											text = entry.characterName
												? `${entry.characterName}: ${entry.description}`
												: entry.description;
										} else if (entry.type === 'note') {
											const cat = entry.category ? `[${getNoteCategoryLabel(entry.category).toUpperCase()}] ` : '';
											text = `${cat}${entry.content}`;
										} else if (entry.type === 'roll' && entry.context) {
											text = `${entry.characterName || 'Unknown'} rolled ${entry.total} on ${entry.context}`;
										}

										return text ? (
											<div key={entry.id} className="flex items-start gap-2 text-sm">
												<Icon path={mdiStar} size={0.5} className="text-gold mt-0.5 flex-shrink-0" />
												<span className="text-stone">{text}</span>
											</div>
										) : null;
									})}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default SessionLinker;
