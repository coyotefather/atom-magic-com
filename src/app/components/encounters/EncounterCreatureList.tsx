'use client';
import Icon from '@mdi/react';
import { mdiPlus, mdiMinus, mdiClose } from '@mdi/js';
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
								<div className="font-semibold text-black truncate">
									{creature.name}
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
								<button
									onClick={() => onQuantityChange(creature.creatureId, -1)}
									className="w-8 h-8 border border-stone bg-white hover:bg-parchment-dark transition-colors flex items-center justify-center"
									title="Decrease quantity"
								>
									<Icon path={mdiMinus} size={0.625} />
								</button>
								<span className="w-8 text-center marcellus text-lg">
									{creature.quantity}
								</span>
								<button
									onClick={() => onQuantityChange(creature.creatureId, 1)}
									className="w-8 h-8 border border-stone bg-white hover:bg-parchment-dark transition-colors flex items-center justify-center"
									title="Increase quantity"
								>
									<Icon path={mdiPlus} size={0.625} />
								</button>
							</div>

							{/* Total threat */}
							<div className="text-right min-w-[60px]">
								<span className="marcellus text-lg text-bronze">{totalThreat}</span>
								<span className="text-xs text-stone block">pts</span>
							</div>

							{/* Remove button */}
							<button
								onClick={() => onRemove(creature.creatureId)}
								className="p-2 text-stone hover:text-oxblood transition-colors"
								title="Remove creature"
							>
								<Icon path={mdiClose} size={0.75} />
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default EncounterCreatureList;
