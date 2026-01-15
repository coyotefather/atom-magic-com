'use client';
import { useState, useMemo } from 'react';
import Icon from '@mdi/react';
import { mdiDiceMultiple, mdiFormatListBulleted } from '@mdi/js';
import CreatureFilters from './CreatureFilters';
import CreatureCard from './CreatureCard';
import {
	CREATURES_QUERY_RESULT,
	CREATURE_FILTERS_QUERY_RESULT,
} from '../../../../sanity.types';

interface CreatureRollerProps {
	creatures: CREATURES_QUERY_RESULT;
	filters: CREATURE_FILTERS_QUERY_RESULT;
}

const CreatureRoller = ({ creatures, filters }: CreatureRollerProps) => {
	const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(
		[]
	);
	const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
	const [selectedChallengeLevels, setSelectedChallengeLevels] = useState<
		string[]
	>([]);
	const [rolledCreature, setRolledCreature] = useState<
		CREATURES_QUERY_RESULT[number] | null
	>(null);
	const [isRolling, setIsRolling] = useState(false);
	const [showAll, setShowAll] = useState(false);

	// Filter creatures based on selections
	const filteredCreatures = useMemo(() => {
		return creatures.filter((creature) => {
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

			// Filter by environment (creature must have at least one matching environment)
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

	const handleRoll = () => {
		if (filteredCreatures.length === 0) return;

		setIsRolling(true);
		setShowAll(false);

		// Simulate rolling animation
		let rollCount = 0;
		const maxRolls = 10;
		const rollInterval = setInterval(() => {
			const randomIndex = Math.floor(
				Math.random() * filteredCreatures.length
			);
			setRolledCreature(filteredCreatures[randomIndex]);
			rollCount++;

			if (rollCount >= maxRolls) {
				clearInterval(rollInterval);
				setIsRolling(false);
			}
		}, 100);
	};

	const handleClearAll = () => {
		setSelectedEnvironments([]);
		setSelectedTypes([]);
		setSelectedChallengeLevels([]);
		setRolledCreature(null);
		setShowAll(false);
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
			{/* Sidebar with filters */}
			<aside className="lg:col-span-1">
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

				{/* Stats */}
				<div className="mt-4 p-4 bg-black text-white">
					<div className="flex items-center justify-between">
						<span className="text-sm text-stone-light">Matching creatures:</span>
						<span className="marcellus text-lg text-bronze">
							{filteredCreatures.length}
						</span>
					</div>
					<div className="flex items-center justify-between mt-2">
						<span className="text-sm text-stone-light">Total creatures:</span>
						<span className="marcellus text-lg text-stone-light">
							{creatures.length}
						</span>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<main className="lg:col-span-3">
				{/* Action buttons */}
				<div className="flex flex-wrap gap-4 mb-8">
					<button
						onClick={handleRoll}
						disabled={filteredCreatures.length === 0 || isRolling}
						className="flex items-center gap-2 px-6 py-3 bg-bronze text-white marcellus uppercase tracking-wider hover:bg-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Icon
							path={mdiDiceMultiple}
							size={1}
							className={isRolling ? 'animate-spin' : ''}
						/>
						{isRolling ? 'Rolling...' : 'Roll Random Creature'}
					</button>

					<button
						onClick={() => {
							setShowAll(!showAll);
							if (!showAll) setRolledCreature(null);
						}}
						className="flex items-center gap-2 px-6 py-3 border-2 border-stone text-stone marcellus uppercase tracking-wider hover:border-bronze hover:text-bronze transition-colors"
					>
						<Icon path={mdiFormatListBulleted} size={1} />
						{showAll ? 'Hide List' : 'Show All Matches'}
					</button>
				</div>

				{/* Empty state */}
				{filteredCreatures.length === 0 && (
					<div className="bg-parchment border-2 border-stone p-12 text-center">
						<p className="text-stone mb-4">
							No creatures match your current filters.
						</p>
						<button
							onClick={handleClearAll}
							className="text-bronze hover:text-gold transition-colors"
						>
							Clear all filters
						</button>
					</div>
				)}

				{/* Rolled creature display */}
				{rolledCreature && !showAll && (
					<div className="max-w-xl">
						<h2 className="marcellus text-lg text-stone mb-4">
							{isRolling ? 'Rolling...' : 'Rolled Creature'}
						</h2>
						<CreatureCard creature={rolledCreature} isSelected />
					</div>
				)}

				{/* All matching creatures */}
				{showAll && filteredCreatures.length > 0 && (
					<div>
						<h2 className="marcellus text-lg text-stone mb-4">
							All Matching Creatures ({filteredCreatures.length})
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{filteredCreatures.map((creature) => (
								<CreatureCard
									key={creature._id}
									creature={creature}
									isSelected={rolledCreature?._id === creature._id}
								/>
							))}
						</div>
					</div>
				)}

				{/* Initial state */}
				{!rolledCreature && !showAll && filteredCreatures.length > 0 && (
					<div className="bg-parchment border-2 border-stone p-12 text-center">
						<Icon
							path={mdiDiceMultiple}
							size={3}
							className="mx-auto text-stone/30 mb-4"
						/>
						<p className="text-stone mb-2">
							Ready to roll from {filteredCreatures.length} creature
							{filteredCreatures.length !== 1 ? 's' : ''}.
						</p>
						<p className="text-sm text-stone/70">
							Use the filters to narrow your selection, then roll for a random
							creature.
						</p>
					</div>
				)}
			</main>
		</div>
	);
};

export default CreatureRoller;
