/**
 * CreatureRoller.tsx
 *
 * A random-creature generator tool for GMs. Shows a filter sidebar
 * (`CreatureFilters`) on the left and a roll area on the right. The user
 * narrows the pool by environment, creature type, and challenge level, then
 * clicks "Roll Random Creature" to pick one at random from the filtered list.
 *
 * The roll is animated: the displayed creature cycles through 10 rapid random
 * selections at 100 ms intervals before settling on a final result, giving a
 * slot-machine feel. The rolled creature is shown as a full `CreatureCard` with
 * the `showCustomize` flag enabled so the user can immediately fork it into a
 * custom creature.
 *
 * A "Show All Matches" toggle switches between the single-result view and a
 * grid of all creatures that pass the current filters, useful for browsing
 * before rolling.
 *
 * Props:
 *   - `creatures` — Full list of CMS creatures (from `CreatureDataContext` or
 *                   passed in directly from the page).
 *   - `filters`   — Available filter values derived from the creature list.
 *
 * Used by:
 *   - src/app/(website)/(creature-tools)/creatures/page.tsx
 */

'use client';
import { useState, useMemo } from 'react';
import Icon from '@mdi/react';
import { mdiDiceMultiple, mdiFormatListBulleted } from '@mdi/js';
import CreatureFilters from './CreatureFilters';
import CreatureCard from './CreatureCard';
import FunctionButton from '@/app/components/common/FunctionButton';
import type { NormedCreature, CreatureFilters as CreatureFiltersType } from '@/lib/creature-types';

interface CreatureRollerProps {
	creatures: NormedCreature[];
	filters: CreatureFiltersType;
}

const CreatureRoller = ({ creatures, filters }: CreatureRollerProps) => {
	const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([]);
	const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
	const [selectedChallengeLevels, setSelectedChallengeLevels] = useState<string[]>([]);
	const [rolledCreature, setRolledCreature] = useState<NormedCreature | null>(null);
	const [isRolling, setIsRolling] = useState(false);
	const [showAll, setShowAll] = useState(false);

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
				const creatureEnvs = creature.environments ?? [];
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

		let rollCount = 0;
		const maxRolls = 10;
		const rollInterval = setInterval(() => {
			const randomIndex = Math.floor(Math.random() * filteredCreatures.length);
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

				<div className="mt-4 p-4 bg-black text-white">
					<div className="flex items-center justify-between">
						<span className="text-sm text-stone-light">Matching creatures:</span>
						<span className="marcellus text-lg text-bronze">{filteredCreatures.length}</span>
					</div>
					<div className="flex items-center justify-between mt-2">
						<span className="text-sm text-stone-light">Total creatures:</span>
						<span className="marcellus text-lg text-stone-light">{creatures.length}</span>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<main className="lg:col-span-3">
				<div className="flex flex-wrap gap-4 mb-8">
					<FunctionButton
						variant="primary"
						onClick={handleRoll}
						isDisabled={filteredCreatures.length === 0 || isRolling}
						icon={mdiDiceMultiple}
						className={`bg-bronze hover:bg-gold ${isRolling ? '[&_svg]:animate-spin' : ''}`}
					>
						{isRolling ? 'Rolling...' : 'Roll Random Creature'}
					</FunctionButton>

					<FunctionButton
						variant="secondary"
						onClick={() => {
							setShowAll(!showAll);
							if (!showAll) setRolledCreature(null);
						}}
						icon={mdiFormatListBulleted}
						className="border-stone text-stone hover:border-bronze hover:text-bronze"
					>
						{showAll ? 'Hide List' : 'Show All Matches'}
					</FunctionButton>
				</div>

				{filteredCreatures.length === 0 && (
					<div className="bg-parchment border-2 border-stone p-12 text-center">
						<p className="text-stone mb-4">No creatures match your current filters.</p>
						<FunctionButton variant="ghost" onClick={handleClearAll} className="hover:text-gold">
							Clear all filters
						</FunctionButton>
					</div>
				)}

				{rolledCreature && !showAll && (
					<div className="max-w-xl">
						<h2 className="marcellus text-lg text-stone mb-4">
							{isRolling ? 'Rolling...' : 'Rolled Creature'}
						</h2>
						<CreatureCard creature={rolledCreature} isSelected showCustomize />
					</div>
				)}

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
									showCustomize
								/>
							))}
						</div>
					</div>
				)}

				{!rolledCreature && !showAll && filteredCreatures.length > 0 && (
					<div className="bg-parchment border-2 border-stone p-12 text-center">
						<Icon path={mdiDiceMultiple} size={3} className="mx-auto text-stone/30 mb-4" />
						<p className="text-stone mb-2">
							Ready to roll from {filteredCreatures.length} creature
							{filteredCreatures.length !== 1 ? 's' : ''}.
						</p>
						<p className="text-sm text-stone/70">
							Use the filters to narrow your selection, then roll for a random creature.
						</p>
					</div>
				)}
			</main>
		</div>
	);
};

export default CreatureRoller;
