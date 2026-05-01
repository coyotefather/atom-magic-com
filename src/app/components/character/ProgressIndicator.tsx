/**
 * ProgressIndicator.tsx
 *
 * A sticky progress bar that appears at the top of the page once the user has started
 * filling out their character (i.e., once `showChooseCulture` becomes true or a name
 * has been entered). It gives a clear sense of how far through the 10-step wizard
 * the user is and what comes next.
 *
 * The indicator has two visual layers:
 *   1. A progress bar that fills from 0–100% as steps are completed.
 *   2. On medium+ screens, a row of step dots with labels showing all 10 steps.
 *      Each dot is filled gold when completed, outlined gold when it's the current
 *      step, and stone-colored for future steps.
 *
 * The 10 steps are hard-coded in the STEPS array:
 *   Basics → Culture → Path → Patronage → Scores → Disciplines → Gear →
 *   Wealth → Companion → Finish
 *
 * Progress percentage is computed as (# completed steps / 10) * 100, rounded to
 * the nearest integer. The current step index is passed from Sections.tsx, which
 * derives it from which sections are currently visible.
 *
 * The component includes ARIA roles (progressbar, aria-valuenow, aria-label) for
 * accessibility.
 *
 * Props:
 *   - currentStep: 0-based index of the step the user is currently on
 *   - completedSteps: boolean[] of length 10, one entry per step
 *
 * Used by:
 *   - Sections.tsx (rendered conditionally after the user begins character creation)
 */
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
