'use client';

import { useState, useMemo } from 'react';
import { mdiClose } from '@mdi/js';
import CreatureFilters from './CreatureFilters';
import FunctionButton from '@/app/components/common/FunctionButton';
import {
	CREATURES_QUERY_RESULT,
	CREATURE_FILTERS_QUERY_RESULT,
} from '../../../../sanity.types';

interface CreaturePickerProps {
	creatures: CREATURES_QUERY_RESULT;
	filters: CREATURE_FILTERS_QUERY_RESULT;
	isOpen: boolean;
	onClose: () => void;
	onSelect: (creature: CREATURES_QUERY_RESULT[number]) => void;
}

const challengeLevelColors: Record<string, string> = {
	harmless: 'bg-stone/10 text-stone-dark',
	trivial: 'bg-stone/20 text-stone',
	easy: 'bg-laurel/20 text-laurel',
	moderate: 'bg-gold/20 text-gold',
	hard: 'bg-bronze/20 text-bronze',
	deadly: 'bg-oxblood/20 text-oxblood',
};

const CreaturePicker = ({
	creatures,
	filters,
	isOpen,
	onClose,
	onSelect,
}: CreaturePickerProps) => {
	const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([]);
	const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
	const [selectedChallengeLevels, setSelectedChallengeLevels] = useState<string[]>([]);

	const filteredCreatures = useMemo(() => {
		return creatures.filter((creature) => {
			if (
				selectedChallengeLevels.length > 0 &&
				creature.challengeLevel &&
				!selectedChallengeLevels.includes(creature.challengeLevel)
			) {
				return false;
			}

			if (
				selectedTypes.length > 0 &&
				creature.creatureType &&
				!selectedTypes.includes(creature.creatureType)
			) {
				return false;
			}

			if (selectedEnvironments.length > 0) {
				const creatureEnvs = creature.environments || [];
				const hasMatchingEnv = creatureEnvs.some((env) =>
					selectedEnvironments.includes(env)
				);
				if (!hasMatchingEnv) {
					return false;
				}
			}

			return true;
		});
	}, [creatures, selectedEnvironments, selectedTypes, selectedChallengeLevels]);

	const handleClearAll = () => {
		setSelectedEnvironments([]);
		setSelectedTypes([]);
		setSelectedChallengeLevels([]);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
			{/* Backdrop */}
			<div className="fixed inset-0 bg-black/60" onClick={onClose} />

			{/* Modal */}
			<div className="relative bg-parchment border-2 border-stone w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
				{/* Header */}
				<div className="p-6 border-b-2 border-stone flex items-center justify-between">
					<h2 className="marcellus text-xl">Choose a Creature to Customize</h2>
					<FunctionButton
						variant="ghost"
						onClick={onClose}
						icon={mdiClose}
						title="Close"
					/>
				</div>

				{/* Filters */}
				<div className="p-4 border-b-2 border-stone">
					<CreatureFilters
						filters={filters}
						selectedEnvironments={selectedEnvironments}
						selectedTypes={selectedTypes}
						selectedChallengeLevels={selectedChallengeLevels}
						onEnvironmentChange={setSelectedEnvironments}
						onTypeChange={setSelectedTypes}
						onChallengeLevelChange={setSelectedChallengeLevels}
						onClearAll={handleClearAll}
					/>
				</div>

				{/* Creature grid (scrollable) */}
				<div className="flex-1 overflow-y-auto p-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{filteredCreatures.map((creature) => (
							<div
								key={creature._id}
								className="bg-white border-2 border-stone p-4 hover:border-bronze transition-colors"
							>
								<h3 className="marcellus text-base mb-1">
									{creature.name}
								</h3>
								<div className="flex items-center gap-2 text-xs text-stone mb-2">
									{creature.creatureType && (
										<span>{creature.creatureType}</span>
									)}
									{creature.challengeLevel && (
										<span
											className={`px-1.5 py-0.5 marcellus uppercase tracking-wider ${
												challengeLevelColors[creature.challengeLevel] ||
												challengeLevelColors.moderate
											}`}
										>
											{creature.challengeLevel}
										</span>
									)}
								</div>
								{creature.description && (
									<p className="text-xs text-stone mb-3 line-clamp-2">
										{creature.description}
									</p>
								)}
								<FunctionButton
									variant="primary"
									size="sm"
									fullWidth
									onClick={() => onSelect(creature)}
									className="bg-bronze hover:bg-gold"
								>
									Select
								</FunctionButton>
							</div>
						))}
					</div>
					{filteredCreatures.length === 0 && (
						<p className="text-center text-stone py-8">
							No creatures match your filters.
						</p>
					)}
				</div>

				{/* Footer with count */}
				<div className="p-4 border-t-2 border-stone text-sm text-stone">
					Showing {filteredCreatures.length} of {creatures.length} creatures
				</div>
			</div>
		</div>
	);
};

export default CreaturePicker;
