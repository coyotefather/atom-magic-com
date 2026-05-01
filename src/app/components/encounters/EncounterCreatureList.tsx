/**
 * EncounterCreatureList.tsx
 *
 * Displays the list of creatures currently in the active encounter. Each row
 * shows the creature name, a "Custom" badge if the creature originates from
 * the user's local roster rather than the CMS, the challenge level badge, and
 * the per-creature threat point value. Inline +/− buttons let the GM adjust
 * quantity. Decrementing to zero removes the creature (handled by the parent
 * via `onQuantityChange`). A remove (×) button on each row allows direct
 * deletion.
 *
 * The right side of each row shows the total threat contribution for that
 * creature type (threat-per-unit × quantity), so the GM can see at a glance
 * which creatures are driving the encounter's difficulty.
 *
 * When the encounter has no creatures, an empty-state message is shown.
 *
 * Props:
 *   - `creatures`       — Array of `EncounterCreature` objects for the current
 *                         encounter.
 *   - `onQuantityChange`— Called with `(creatureId, delta)` (+1 or -1).
 *   - `onRemove`        — Called with `creatureId` to delete the entire row.
 *
 * Used by:
 *   - src/app/components/encounters/EncounterBuilder.tsx
 */

'use client';
import { mdiPlus, mdiMinus, mdiClose } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';
import {
	EncounterCreature,
	getChallengeLevelColor,
	getCreatureThreat,
} from '@/lib/encounter-data';

interface EncounterCreatureListProps {
	creatures: EncounterCreature[];
	onQuantityChange: (creatureId: string, delta: number) => void;
	onRemove: (creatureId: string) => void;
}

const challengeLevelLabels: Record<string, string> = {
	harmless: 'Harmless',
	trivial: 'Trivial',
	easy: 'Easy',
	moderate: 'Moderate',
	hard: 'Hard',
	deadly: 'Deadly',
};

const EncounterCreatureList = ({
	creatures,
	onQuantityChange,
	onRemove,
}: EncounterCreatureListProps) => {
	if (creatures.length === 0) {
		return (
			<div className="bg-parchment border-2 border-stone p-6">
				<h3 className="marcellus text-lg text-black mb-4">Encounter Creatures</h3>
				<p className="text-sm text-stone text-center py-4">
					No creatures added yet. Use the selector above to add creatures to your encounter.
				</p>
			</div>
		);
	}

	return (
		<div className="bg-parchment border-2 border-stone">
			<div className="p-4 border-b-2 border-stone">
				<h3 className="marcellus text-lg text-black">Encounter Creatures</h3>
			</div>

			<div className="divide-y divide-stone/30">
				{creatures.map(creature => {
					const threatPts = getCreatureThreat(creature.challengeLevel);
					const totalThreat = threatPts * creature.quantity;

					return (
						<div
							key={creature.creatureId}
							className="flex items-center justify-between gap-4 p-4"
						>
							{/* Creature info */}
							<div className="flex-1 min-w-0">
								<div className="font-semibold text-black truncate flex items-center gap-2">
									{creature.name}
									{creature.source === 'custom' && (
										<span className="px-1.5 py-0.5 text-xs bg-bronze/20 text-bronze uppercase tracking-wider shrink-0">
											Custom
										</span>
									)}
								</div>
								<div className="flex items-center gap-2 mt-1">
									<span
										className={`px-1.5 py-0.5 text-xs ${getChallengeLevelColor(
											creature.challengeLevel
										)}`}
									>
										{challengeLevelLabels[creature.challengeLevel] || creature.challengeLevel}
									</span>
									<span className="text-xs text-stone">
										{threatPts} pts each
									</span>
								</div>
							</div>

							{/* Quantity controls */}
							<div className="flex items-center gap-2">
								<FunctionButton
									variant="secondary"
									size="sm"
									onClick={() => onQuantityChange(creature.creatureId, -1)}
									icon={mdiMinus}
									isIconOnly
									title="Decrease quantity"
									className="w-8 h-8 px-0 border-stone"
								/>
								<span className="w-8 text-center marcellus text-lg">
									{creature.quantity}
								</span>
								<FunctionButton
									variant="secondary"
									size="sm"
									onClick={() => onQuantityChange(creature.creatureId, 1)}
									icon={mdiPlus}
									isIconOnly
									title="Increase quantity"
									className="w-8 h-8 px-0 border-stone"
								/>
							</div>

							{/* Total threat */}
							<div className="text-right min-w-[60px]">
								<span className="marcellus text-lg text-bronze">{totalThreat}</span>
								<span className="text-xs text-stone block">pts</span>
							</div>

							{/* Remove button */}
							<FunctionButton
								variant="ghost"
								size="sm"
								onClick={() => onRemove(creature.creatureId)}
								icon={mdiClose}
								title="Remove creature"
								className="hover:text-oxblood"
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default EncounterCreatureList;
