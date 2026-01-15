'use client';
import { CREATURE_FILTERS_QUERY_RESULT } from '../../../../sanity.types';

interface CreatureFiltersProps {
	filters: CREATURE_FILTERS_QUERY_RESULT;
	selectedEnvironments: string[];
	selectedTypes: string[];
	selectedChallengeLevels: string[];
	onEnvironmentChange: (environments: string[]) => void;
	onTypeChange: (types: string[]) => void;
	onChallengeLevelChange: (levels: string[]) => void;
	onClearAll: () => void;
}

const CreatureFilters = ({
	filters,
	selectedEnvironments,
	selectedTypes,
	selectedChallengeLevels,
	onEnvironmentChange,
	onTypeChange,
	onChallengeLevelChange,
	onClearAll,
}: CreatureFiltersProps) => {
	const hasActiveFilters =
		selectedEnvironments.length > 0 ||
		selectedTypes.length > 0 ||
		selectedChallengeLevels.length > 0;

	const handleEnvironmentToggle = (env: string) => {
		if (selectedEnvironments.includes(env)) {
			onEnvironmentChange(selectedEnvironments.filter((e) => e !== env));
		} else {
			onEnvironmentChange([...selectedEnvironments, env]);
		}
	};

	const handleTypeToggle = (type: string) => {
		if (selectedTypes.includes(type)) {
			onTypeChange(selectedTypes.filter((t) => t !== type));
		} else {
			onTypeChange([...selectedTypes, type]);
		}
	};

	const handleChallengeLevelToggle = (level: string) => {
		if (selectedChallengeLevels.includes(level)) {
			onChallengeLevelChange(
				selectedChallengeLevels.filter((l) => l !== level)
			);
		} else {
			onChallengeLevelChange([...selectedChallengeLevels, level]);
		}
	};

	const challengeLevelLabels: Record<string, string> = {
		harmless: 'Harmless',
		trivial: 'Trivial',
		easy: 'Easy',
		moderate: 'Moderate',
		hard: 'Hard',
		deadly: 'Deadly',
	};

	return (
		<div className="bg-parchment border-2 border-stone p-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="marcellus text-lg text-black">Filter Creatures</h2>
				{hasActiveFilters && (
					<button
						onClick={onClearAll}
						className="text-sm text-stone hover:text-oxblood transition-colors"
					>
						Clear All
					</button>
				)}
			</div>

			<div className="space-y-6">
				{/* Challenge Level */}
				<div>
					<h3 className="marcellus text-sm uppercase tracking-wider text-stone mb-3">
						Challenge Level
					</h3>
					<div className="flex flex-wrap gap-2">
						{filters.challengeLevels.map((level) => (
							<button
								key={level}
								onClick={() => handleChallengeLevelToggle(level)}
								className={`px-3 py-1.5 text-sm border transition-colors ${
									selectedChallengeLevels.includes(level)
										? 'bg-bronze text-white border-bronze'
										: 'bg-white text-stone border-stone hover:border-bronze hover:text-bronze'
								}`}
							>
								{challengeLevelLabels[level] || level}
							</button>
						))}
					</div>
				</div>

				{/* Creature Type */}
				{filters.creatureTypes && filters.creatureTypes.length > 0 && (
					<div>
						<h3 className="marcellus text-sm uppercase tracking-wider text-stone mb-3">
							Creature Type
						</h3>
						<div className="flex flex-wrap gap-2">
							{filters.creatureTypes
								.filter((type): type is string => type !== null)
								.map((type) => (
									<button
										key={type}
										onClick={() => handleTypeToggle(type)}
										className={`px-3 py-1.5 text-sm border transition-colors ${
											selectedTypes.includes(type)
												? 'bg-bronze text-white border-bronze'
												: 'bg-white text-stone border-stone hover:border-bronze hover:text-bronze'
										}`}
									>
										{type}
									</button>
								))}
						</div>
					</div>
				)}

				{/* Environments */}
				{filters.environments && filters.environments.length > 0 && (
					<div>
						<h3 className="marcellus text-sm uppercase tracking-wider text-stone mb-3">
							Environment
						</h3>
						<div className="flex flex-wrap gap-2">
							{filters.environments
								.filter((env): env is string => env !== null)
								.map((env) => (
									<button
										key={env}
										onClick={() => handleEnvironmentToggle(env)}
										className={`px-3 py-1.5 text-sm border transition-colors ${
											selectedEnvironments.includes(env)
												? 'bg-bronze text-white border-bronze'
												: 'bg-white text-stone border-stone hover:border-bronze hover:text-bronze'
										}`}
									>
										{env}
									</button>
								))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default CreatureFilters;
