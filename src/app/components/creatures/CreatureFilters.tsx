'use client';
import { CREATURE_FILTERS_QUERY_RESULT } from '../../../../sanity.types';
import FunctionButton from '@/app/components/common/FunctionButton';

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
					<FunctionButton
						variant="ghost"
						size="sm"
						onClick={onClearAll}
						className="hover:text-oxblood"
					>
						Clear All
					</FunctionButton>
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
							<FunctionButton
								key={level}
								variant="chip"
								size="sm"
								isActive={selectedChallengeLevels.includes(level)}
								onClick={() => handleChallengeLevelToggle(level)}
							>
								{challengeLevelLabels[level] || level}
							</FunctionButton>
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
									<FunctionButton
										key={type}
										variant="chip"
										size="sm"
										isActive={selectedTypes.includes(type)}
										onClick={() => handleTypeToggle(type)}
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
						<h3 className="marcellus text-sm uppercase tracking-wider text-stone mb-3">
							Environment
						</h3>
						<div className="flex flex-wrap gap-2">
							{filters.environments
								.filter((env): env is string => env !== null)
								.map((env) => (
									<FunctionButton
										key={env}
										variant="chip"
										size="sm"
										isActive={selectedEnvironments.includes(env)}
										onClick={() => handleEnvironmentToggle(env)}
									>
										{env}
									</FunctionButton>
								))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default CreatureFilters;
