/**
 * EncounterRoster.tsx
 *
 * Sidebar panel listing all saved encounters. Each encounter is shown as a
 * clickable summary card displaying the encounter name, the number of
 * creatures, party size, total threat points, and the computed difficulty
 * label (colour-coded from trivial to deadly). The active encounter is
 * highlighted with a bronze border and a left-edge accent bar.
 *
 * A delete button (visible on hover) removes an encounter immediately with no
 * confirm step (deletion is handled by the parent). A "New Encounter" button
 * at the bottom delegates to `onNew`.
 *
 * This component is purely presentational — all state lives in the parent
 * `EncounterBuilder`. It receives the list of encounters and callbacks for
 * every action.
 *
 * Props:
 *   - `encounters`        — All saved encounters to display.
 *   - `activeEncounterId` — ID of the currently selected encounter (for
 *                           highlighting).
 *   - `onSelect`          — Called with the encounter ID when a card is clicked.
 *   - `onDelete`          — Called with the encounter ID when the delete button
 *                           is clicked.
 *   - `onNew`             — Called when the "New Encounter" button is clicked.
 *
 * Used by:
 *   - src/app/components/encounters/EncounterBuilder.tsx
 */

'use client';
import { mdiPlus, mdiDelete } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';
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
										<FunctionButton
											variant="ghost"
											size="sm"
											onClick={e => {
												e?.stopPropagation();
												onDelete(encounter.id);
											}}
											icon={mdiDelete}
											title="Delete encounter"
											className="opacity-0 group-hover:opacity-100 hover:text-oxblood"
										/>
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
				<FunctionButton
					variant="primary"
					fullWidth
					onClick={onNew}
					icon={mdiPlus}
					className="bg-bronze hover:bg-gold"
				>
					New Encounter
				</FunctionButton>
			</div>
		</div>
	);
};

export default EncounterRoster;
