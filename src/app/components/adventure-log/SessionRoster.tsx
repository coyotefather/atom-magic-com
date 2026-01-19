'use client';
import Icon from '@mdi/react';
import { mdiPlus, mdiDelete, mdiStar } from '@mdi/js';
import { SessionSummary, formatFullTimestamp } from '@/lib/adventure-log-data';

interface SessionRosterProps {
	sessions: SessionSummary[];
	activeSessionId: string | null;
	onSelect: (id: string) => void;
	onDelete: (id: string) => void;
	onNew: () => void;
}

const SessionRoster = ({
	sessions,
	activeSessionId,
	onSelect,
	onDelete,
	onNew,
}: SessionRosterProps) => {
	return (
		<div className="bg-parchment border-2 border-stone">
			<div className="p-4 border-b-2 border-stone">
				<h2 className="marcellus text-lg text-black">Sessions</h2>
			</div>

			<div className="p-4 space-y-2">
				{sessions.length === 0 ? (
					<p className="text-sm text-stone py-4 text-center">
						No saved sessions yet.
					</p>
				) : (
					sessions.map(session => {
						const isActive = session.id === activeSessionId;

						return (
							<div
								key={session.id}
								className={`relative group border-2 transition-colors cursor-pointer ${
									isActive
										? 'border-bronze bg-white'
										: 'border-stone/50 bg-white hover:border-bronze'
								}`}
								onClick={() => onSelect(session.id)}
							>
								<div className="p-3">
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1 min-w-0">
											<h3 className="marcellus text-base text-black truncate">
												{session.name || 'Unnamed Session'}
											</h3>
											<div className="flex items-center gap-3 mt-1 text-xs text-stone">
												<span>
													{session.entryCount} entr{session.entryCount !== 1 ? 'ies' : 'y'}
												</span>
												{session.keyEventCount > 0 && (
													<span className="flex items-center gap-1 text-gold">
														<Icon path={mdiStar} size={0.5} />
														{session.keyEventCount} key
													</span>
												)}
											</div>
											<div className="text-xs text-stone/70 mt-1">
												{formatFullTimestamp(session.lastModified)}
											</div>
										</div>
										<button
											onClick={e => {
												e.stopPropagation();
												onDelete(session.id);
											}}
											className="p-1 text-stone hover:text-oxblood opacity-0 group-hover:opacity-100 transition-all"
											title="Delete session"
										>
											<Icon path={mdiDelete} size={0.75} />
										</button>
									</div>
								</div>
								{isActive && (
									<div className="absolute left-0 top-0 bottom-0 w-1 bg-bronze" />
								)}
							</div>
						);
					})
				)}
			</div>

			<div className="p-4 border-t-2 border-stone">
				<button
					onClick={onNew}
					className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-bronze text-white marcellus uppercase tracking-wider hover:bg-gold transition-colors"
				>
					<Icon path={mdiPlus} size={0.75} />
					New Session
				</button>
			</div>
		</div>
	);
};

export default SessionRoster;
