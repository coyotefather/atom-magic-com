'use client';
import { useState, useMemo } from 'react';
import Icon from '@mdi/react';
import { mdiPlus, mdiChevronDown, mdiChevronUp } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';
import { getChallengeLevelColor, THREAT_VALUES } from '@/lib/encounter-data';
import {
	CREATURES_QUERY_RESULT,
	CREATURE_FILTERS_QUERY_RESULT,
} from '../../../../sanity.types';

type Creature = CREATURES_QUERY_RESULT[number];

interface CreatureSelectorProps {
	creatures: CREATURES_QUERY_RESULT;
	filters: CREATURE_FILTERS_QUERY_RESULT;
	onAddCreature: (creature: Creature) => void;
}

const challengeLevelLabels: Record<string, string> = {
	harmless: 'Harmless',
	trivial: 'Trivial',
	easy: 'Easy',
	moderate: 'Moderate',
	hard: 'Hard',
	deadly: 'Deadly',
};

const CreatureSelector = ({
	creatures,
	filters,
	onAddCreature,
}: CreatureSelectorProps) => {
	const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([]);
	const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
	const [selectedChallengeLevels, setSelectedChallengeLevels] = useState<string[]>([]);
	const [isExpanded, setIsExpanded] = useState(true);
	const [showAll, setShowAll] = useState(false);

	// Filter creatures based on selections
	const filteredCreatures = useMemo(() => {
		return creatures.filter(creature => {
			// Filter by challenge level
			if (
				selectedChallengeLevels.length > 0 &&
				creature.challengeLevel &&
				!selectedChallengeLevels.includes(creature.challengeLevel)
			) {
				return false;
			}

			// Filter by creature type
			if (
				selectedTypes.length > 0 &&
				creature.creatureType &&
				!selectedTypes.includes(creature.creatureType)
			) {
				return false;
			}

			// Filter by environment
			if (selectedEnvironments.length > 0) {
				const creatureEnvs = creature.environments || [];
				const hasMatchingEnv = creatureEnvs.some(env =>
					selectedEnvironments.includes(env)
				);
				if (!hasMatchingEnv) {
					return false;
				}
			}

			return true;
		});
	}, [creatures, selectedEnvironments, selectedTypes, selectedChallengeLevels]);

	const hasActiveFilters =
		selectedEnvironments.length > 0 ||
		selectedTypes.length > 0 ||
		selectedChallengeLevels.length > 0;

	const handleClearAll = () => {
		setSelectedEnvironments([]);
		setSelectedTypes([]);
		setSelectedChallengeLevels([]);
	};

	const toggleFilter = (
		value: string,
		selected: string[],
		setter: (values: string[]) => void
	) => {
		if (selected.includes(value)) {
			setter(selected.filter(v => v !== value));
		} else {
			setter([...selected, value]);
		}
	};

	// Show limited creatures by default
	const displayCreatures = showAll ? filteredCreatures : filteredCreatures.slice(0, 12);

	return (
		<div className="bg-parchment border-2 border-stone">
			{/* Header */}
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className="w-full flex items-center justify-between p-4 hover:bg-parchment-dark transition-colors"
			>
				<h3 className="marcellus text-lg text-black">Add Creatures</h3>
				<Icon
					path={isExpanded ? mdiChevronUp : mdiChevronDown}
					size={1}
					className="text-stone"
				/>
			</button>

			{isExpanded && (
				<div className="px-4 pb-4">
					{/* Filters */}
					<div className="space-y-4 mb-6">
						{/* Challenge Level */}
						<div>
							<div className="flex items-center justify-between mb-2">
								<h4 className="text-xs text-stone uppercase tracking-wider">
									Challenge Level
								</h4>
								{hasActiveFilters && (
									<FunctionButton
										variant="ghost"
										size="sm"
										onClick={handleClearAll}
										className="hover:text-oxblood"
									>
										Clear All
									</FunctionButton>
								)}
							</div>
							<div className="flex flex-wrap gap-2">
								{filters.challengeLevels.map(level => (
									<FunctionButton
										key={level}
										variant="chip"
										size="sm"
										isActive={selectedChallengeLevels.includes(level)}
										onClick={() =>
											toggleFilter(
												level,
												selectedChallengeLevels,
												setSelectedChallengeLevels
											)
										}
									>
										{challengeLevelLabels[level] || level}
									</FunctionButton>
								))}
							</div>
						</div>

						{/* Creature Type */}
						{filters.creatureTypes && filters.creatureTypes.length > 0 && (
							<div>
								<h4 className="text-xs text-stone uppercase tracking-wider mb-2">
									Creature Type
								</h4>
								<div className="flex flex-wrap gap-2">
									{filters.creatureTypes
										.filter((type): type is string => type !== null)
										.map(type => (
											<FunctionButton
												key={type}
												variant="chip"
												size="sm"
												isActive={selectedTypes.includes(type)}
												onClick={() =>
													toggleFilter(type, selectedTypes, setSelectedTypes)
												}
											>
												{type}
											</FunctionButton>
										))}
								</div>
							</div>
						)}

						{/* Environments */}
						{filters.environments && filters.environments.length > 0 && (
							<div>
								<h4 className="text-xs text-stone uppercase tracking-wider mb-2">
									Environment
								</h4>
								<div className="flex flex-wrap gap-2">
									{filters.environments
										.filter((env): env is string => env !== null)
										.map(env => (
											<FunctionButton
												key={env}
												variant="chip"
												size="sm"
												isActive={selectedEnvironments.includes(env)}
												onClick={() =>
													toggleFilter(
														env,
														selectedEnvironments,
														setSelectedEnvironments
													)
												}
											>
												{env}
											</FunctionButton>
										))}
								</div>
							</div>
						)}
					</div>

					{/* Creature count */}
					<div className="text-sm text-stone mb-4">
						Showing {displayCreatures.length} of {filteredCreatures.length} creatures
						{filteredCreatures.length !== creatures.length && (
							<span> (filtered from {creatures.length} total)</span>
						)}
					</div>

					{/* Creature grid */}
					{filteredCreatures.length === 0 ? (
						<div className="text-center py-6 text-stone">
							No creatures match your filters.
						</div>
					) : (
						<>
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
								{displayCreatures.map(creature => {
									const challengeLevel = creature.challengeLevel || 'moderate';
									const threatPts = THREAT_VALUES[challengeLevel] || 0;

									return (
										<button
											key={creature._id}
											onClick={() => onAddCreature(creature)}
											className="group text-left p-3 bg-white border-2 border-stone/50 hover:border-bronze transition-colors"
										>
											<div className="flex items-start justify-between gap-1">
												<div className="flex-1 min-w-0">
													<div className="font-semibold text-sm text-black truncate">
														{creature.name}
													</div>
													<div className="flex items-center gap-2 mt-1">
														<span
															className={`px-1.5 py-0.5 text-xs ${getChallengeLevelColor(
																challengeLevel
															)}`}
														>
															{challengeLevelLabels[challengeLevel]}
														</span>
														<span className="text-xs text-stone">
															{threatPts} pts
														</span>
													</div>
												</div>
												<div className="p-1 text-stone group-hover:text-bronze transition-colors">
													<Icon path={mdiPlus} size={0.625} />
												</div>
											</div>
										</button>
									);
								})}
							</div>

							{/* Show more/less */}
							{filteredCreatures.length > 12 && (
								<FunctionButton
									variant="ghost"
									fullWidth
									onClick={() => setShowAll(!showAll)}
									className="mt-4 text-bronze hover:text-gold"
								>
									{showAll
										? 'Show Less'
										: `Show All ${filteredCreatures.length} Creatures`}
								</FunctionButton>
							)}
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default CreatureSelector;
