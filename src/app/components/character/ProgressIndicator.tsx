'use client';

import { useMemo } from 'react';

interface ProgressIndicatorProps {
	currentStep: number;
	completedSteps: boolean[];
}

const STEPS = [
	'Basics',
	'Culture',
	'Path',
	'Patronage',
	'Scores',
	'Disciplines',
	'Gear',
	'Wealth',
	'Companion',
	'Finish'
];

const ProgressIndicator = ({ currentStep, completedSteps }: ProgressIndicatorProps) => {
	const progress = useMemo(() => {
		const completed = completedSteps.filter(Boolean).length;
		return Math.round((completed / STEPS.length) * 100);
	}, [completedSteps]);

	return (
		<div
			className="sticky top-0 z-40 bg-white border-b-2 border-stone shadow-sm"
			role="progressbar"
			aria-valuenow={progress}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-label={`Character creation progress: ${progress}% complete`}
		>
			<div className="container py-3">
				<div className="flex items-center justify-between mb-2">
					<span className="font-marcellus text-sm text-stone">
						Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
					</span>
					<span className="font-marcellus text-sm text-gold">
						{progress}% Complete
					</span>
				</div>

				{/* Progress bar */}
				<div className="h-2 bg-parchment border border-stone shadow-inner">
					<div
						className="h-full bg-gold transition-all duration-300 ease-out shadow-sm"
						style={{ width: `${progress}%` }}
					/>
				</div>

				{/* Step indicators - hidden on mobile */}
				<div className="hidden md:flex justify-between mt-2">
					{STEPS.map((step, index) => (
						<div
							key={step}
							className="flex flex-col items-center"
						>
							<div
								className={`
									w-3 h-3 border-2 transition-colors
									${completedSteps[index]
										? 'bg-gold border-gold'
										: index === currentStep
											? 'bg-white border-gold'
											: 'bg-white border-stone'
									}
								`}
								aria-hidden="true"
							/>
							<span
								className={`
									text-[10px] mt-1 font-marcellus
									${index === currentStep ? 'text-gold font-bold' : 'text-stone'}
								`}
							>
								{step}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default ProgressIndicator;
