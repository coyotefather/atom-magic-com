'use client';
import Icon from '@mdi/react';
import { mdiPlus, mdiDelete } from '@mdi/js';
import {
	Encounter,
	calculateTotalThreat,
	getDifficultyRating,
	getDifficultyColor,
	getDifficultyLabel,
	calculateThreatPerPlayer,
} from '@/lib/encounter-data';

interface EncounterRosterProps {
	encounters: Encounter[];
	activeEncounterId: string | null;
	onSelect: (id: string) => void;
	onDelete: (id: string) => void;
	onNew: () => void;
}

const EncounterRoster = ({
	encounters,
	activeEncounterId,
	onSelect,
	onDelete,
	onNew,
}: EncounterRosterProps) => {
	return (
		<div className="bg-parchment border-2 border-stone">
			<div className="p-4 border-b-2 border-stone">
				<h2 className="marcellus text-lg text-black">Saved Encounters</h2>
			</div>

			<div className="p-4 space-y-2">
				{encounters.length === 0 ? (
					<p className="text-sm text-stone py-4 text-center">
						No saved encounters yet.
					</p>
				) : (
					encounters.map(encounter => {
						const isActive = encounter.id === activeEncounterId;
						const totalThreat = calculateTotalThreat(encounter.creatures);
						const threatPerPlayer = calculateThreatPerPlayer(totalThreat, encounter.partySize);
						const rating = getDifficultyRating(threatPerPlayer);
						const ratingColor = getDifficultyColor(rating);

						return (
							<div
								key={encounter.id}
								className={`relative group border-2 transition-colors cursor-pointer ${
									isActive
										? 'border-bronze bg-white'
										: 'border-stone/50 bg-white hover:border-bronze'
								}`}
								onClick={() => onSelect(encounter.id)}
							>
								<div className="p-3">
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1 min-w-0">
											<h3 className="marcellus text-base text-black truncate">
												{encounter.name || 'Unnamed Encounter'}
											</h3>
											<div className="flex items-center gap-3 mt-1 text-xs">
												<span className="text-stone">
													{encounter.creatures.length} creature{encounter.creatures.length !== 1 ? 's' : ''}
												</span>
												<span className="text-stone">
													Party: {encounter.partySize}
												</span>
											</div>
											<div className="flex items-center gap-2 mt-2">
												<span className="text-xs text-stone">Threat:</span>
												<span className="marcellus text-bronze">{totalThreat}</span>
												<span className={`text-xs uppercase ${ratingColor}`}>
													{getDifficultyLabel(rating)}
												</span>
											</div>
										</div>
										<button
											onClick={e => {
												e.stopPropagation();
												onDelete(encounter.id);
											}}
											className="p-1 text-stone hover:text-oxblood opacity-0 group-hover:opacity-100 transition-all"
											title="Delete encounter"
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
					New Encounter
				</button>
			</div>
		</div>
	);
};

export default EncounterRoster;
