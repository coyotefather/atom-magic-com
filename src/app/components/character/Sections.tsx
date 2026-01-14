'use client';
import { useState, useMemo } from 'react';
import Section from '@/app/components/common/Section';
import TheBasics from '@/app/components/character/sections/TheBasics';
import CharacterOptions from '@/app/components/character/sections/CharacterOptions';
import AdjustScores from '@/app/components/character/sections/scores/AdjustScores';
import AdditionalScores from '@/app/components/character/sections/scores/AdditionalScores';
import Scores from '@/app/components/character/sections/scores/Scores';
import ChooseCulture from '@/app/components/character/sections/ChooseCulture';
import ChoosePath from '@/app/components/character/sections/ChoosePath';
import ChoosePatronage from '@/app/components/character/sections/ChoosePatronage';
import ChooseDisciplineAndTechniques from '@/app/components/character/sections/ChooseDisciplinesAndTechniques';
import ManageGear from '@/app/components/character/sections/ManageGear';
import ManageWealth from '@/app/components/character/sections/ManageWealth';
import ChooseAnimalCompanion from '@/app/components/character/sections/ChooseAnimalCompanion';
import WrapUp from '@/app/components/character/sections/WrapUp';
import ProgressIndicator from '@/app/components/character/ProgressIndicator';
import CharacterHero from '@/app/components/character/CharacterHero';
import { useAppSelector } from '@/lib/hooks';
import { useCharacterPersistence } from '@/lib/hooks/useCharacterPersistence';
import { useCharacterValidation } from '@/lib/hooks/useCharacterValidation';

import {
	CULTURES_QUERY_RESULT,
	SCORES_QUERY_RESULT,
	ADDITIONAL_SCORES_QUERY_RESULT,
	PATHS_QUERY_RESULT,
	PATRONAGES_QUERY_RESULT,
	DISCIPLINES_QUERY_RESULT,
	GEAR_QUERY_RESULT,
} from "../../../../sanity.types";

interface Modifier {
	_id: string,
	parent_id: string,
	value: number | null
};

interface Modifiers {
	path: Modifier[],
	gear: Modifier[]
};

const Sections = ({
		cultures,
		scores,
		additionalScores,
		paths,
		patronages,
		disciplines,
		gear,
	}:{
		cultures: CULTURES_QUERY_RESULT,
		scores: SCORES_QUERY_RESULT,
		additionalScores: ADDITIONAL_SCORES_QUERY_RESULT,
		paths: PATHS_QUERY_RESULT,
		patronages: PATRONAGES_QUERY_RESULT,
		disciplines: DISCIPLINES_QUERY_RESULT,
		gear: GEAR_QUERY_RESULT,
	}) => {
	const character = useAppSelector(state => state.character);
	const { showResumePrompt, resumeCharacter, startFresh } = useCharacterPersistence();
	const {
		basicsIncomplete,
		cultureIncomplete,
		pathIncomplete,
		patronageIncomplete,
		disciplinesIncomplete,
		gearIncomplete,
		wealthIncomplete,
		animalCompanionIncomplete,
		clickCheck,
		setClickCheck,
	} = useCharacterValidation();

	const [showChooseCulture, setShowChooseCulture] = useState(false);
	const [showChoosePath, setShowChoosePath] = useState(false);
	const [showChoosePatronage, setShowChoosePatronage] = useState(false);
	const [showChooseDisciplinesAndTechniques, setShowDisciplinesAndTechniques] = useState(false);
	const [showAdjustScoresAndScores, setShowAdjustScoresAndScores] = useState(false);
	const [showManageGear, setShowManageGear] = useState(false);
	const [showManageWealth, setShowManageWealth] = useState(false);
	const [showChooseAnimalCompanion, setShowChooseAnimalCompanion] = useState(false);
	const [showWrapUp, setShowWrapUp] = useState(false);

	const rollCharacter = () => {
		setShowChooseCulture(true);
		setShowChoosePath(true);
		setShowChoosePatronage(true);
		setShowAdjustScoresAndScores(true);
		setShowDisciplinesAndTechniques(true);
		setShowManageGear(true);
		setShowManageWealth(true);
		setShowChooseAnimalCompanion(true);
		setShowWrapUp(true);
	};

	let modifiers: Modifiers | undefined = { path: [], gear: [] };
	paths.map( (path) => {
		if(path.modifiers) {
			path.modifiers.map( (m) => {
				if(m.modifierSubscore && m.modifierSubscore._id && m.modifierSubscore.score && path._id === character.path) {
					modifiers.path.push({ _id: m.modifierSubscore._id, parent_id: m.modifierSubscore.score._id, value: m.modifierValue });
				}
			});
		}
	});

	// Note: Gear modifiers are now handled through the enhancement system in gear-data.ts
	// The old Sanity-based gear modifier system has been replaced

	// Calculate progress for the progress indicator
	const completedSteps = useMemo(() => [
		character.name !== '',                    // Basics
		character.culture !== '',                 // Culture
		character.path !== '',                    // Path
		character.patronage !== '',               // Patronage
		character.scores.length > 0,              // Scores
		character.disciplines.length > 0,         // Disciplines
		character.gear.length > 0,                // Gear
		character.wealth.silver > 0,              // Wealth
		character.animalCompanion.id !== '',      // Companion
		showWrapUp                                // Finish (reached wrap up)
	], [character, showWrapUp]);

	const currentStep = useMemo(() => {
		if (showWrapUp) return 9;
		if (showChooseAnimalCompanion) return 8;
		if (showManageWealth) return 7;
		if (showManageGear) return 6;
		if (showChooseDisciplinesAndTechniques) return 5;
		if (showAdjustScoresAndScores) return 4;
		if (showChoosePatronage) return 3;
		if (showChoosePath) return 2;
		if (showChooseCulture) return 1;
		return 0;
	}, [showChooseCulture, showChoosePath, showChoosePatronage, showAdjustScoresAndScores, showChooseDisciplinesAndTechniques, showManageGear, showManageWealth, showChooseAnimalCompanion, showWrapUp]);

	// Only show progress indicator once user has started
	const showProgress = showChooseCulture || character.name !== '';
	const hasStarted = showProgress;

	return (
		<div className="notoserif">
			{/* Hero - full or compact based on whether user has started */}
			<CharacterHero compact={hasStarted} />

			{/* Progress indicator */}
			{showProgress && (
				<ProgressIndicator
					currentStep={currentStep}
					completedSteps={completedSteps}
				/>
			)}

			{/* Resume dialog */}
			{showResumePrompt && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white border-2 border-stone max-w-md mx-4">
						<div className="h-1 bg-oxblood" />
						<div className="p-8">
							<h2 className="marcellus text-xl text-black mb-4">
								Resume Previous Character?
							</h2>
							<p className="text-stone-dark mb-6">
								You have an unfinished character. Would you like to continue
								where you left off?
							</p>
							<div className="flex gap-4 justify-end">
								<button
									onClick={startFresh}
									className="px-4 py-2 border-2 border-stone text-stone marcellus uppercase tracking-wider text-sm hover:border-oxblood hover:text-oxblood transition-colors"
								>
									Start Fresh
								</button>
								<button
									onClick={resumeCharacter}
									className="px-4 py-2 bg-oxblood text-white marcellus uppercase tracking-wider text-sm hover:bg-oxblood-dark transition-colors"
								>
									Resume
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			<Section
				expanded={true}
				nextExpanded={true}
				incomplete={""}
				showExpandButton={false}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => { return; }}>
				<CharacterOptions
					buttonFunction={() => rollCharacter()} />
			</Section>
			<Section
				expanded={true}
				nextExpanded={showChooseCulture}
				incomplete={basicsIncomplete}
				showExpandButton={true}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => setShowChooseCulture(true)}>
				<TheBasics incompleteFields={basicsIncomplete} />
			</Section>
			<Section
				expanded={showChooseCulture}
				nextExpanded={showChoosePath}
				incomplete={cultureIncomplete}
				showExpandButton={true}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => setShowChoosePath(true)}>
				<ChooseCulture
					cultures={cultures}
					incompleteFields={cultureIncomplete} />
			</Section>
			<Section
				expanded={showChoosePath}
				nextExpanded={showChoosePatronage}
				incomplete={pathIncomplete}
				showExpandButton={true}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => setShowChoosePatronage(true)}>
				<ChoosePath
					paths={paths}
					incompleteFields={pathIncomplete} />
			</Section>
			<Section
				expanded={showChoosePatronage}
				nextExpanded={showAdjustScoresAndScores}
				incomplete={patronageIncomplete}
				showExpandButton={true}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => setShowAdjustScoresAndScores(true)}>
				<ChoosePatronage
					patronages={patronages}
					incompleteFields={patronageIncomplete} />
			</Section>
			<Section
				expanded={showAdjustScoresAndScores}
				nextExpanded={false}
				incomplete={""}
				showExpandButton={false}
				variant="dark"
				clickCheck={setClickCheck}
				expandFunction={() => { return; }}>
				<AdjustScores />
			</Section>
			<Section
				expanded={showAdjustScoresAndScores}
				nextExpanded={false}
				incomplete={""}
				showExpandButton={false}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => { return; }}>
				<Scores
					scores={scores}
					modifiers={modifiers} />
			</Section>
			<Section
				expanded={showAdjustScoresAndScores}
				nextExpanded={showChooseDisciplinesAndTechniques}
				incomplete={""}
				showExpandButton={true}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => setShowDisciplinesAndTechniques(true)}>
				<AdditionalScores
					additionalScores={additionalScores} />
			</Section>
			<Section
				expanded={showChooseDisciplinesAndTechniques}
				nextExpanded={showManageGear}
				incomplete={disciplinesIncomplete}
				showExpandButton={true}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => setShowManageGear(true)}>
				<ChooseDisciplineAndTechniques
					disciplines={disciplines}
					incompleteFields={disciplinesIncomplete} />
			</Section>
			<Section
				expanded={showManageGear}
				nextExpanded={showManageWealth}
				incomplete={gearIncomplete}
				showExpandButton={true}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => setShowManageWealth(true)}>
				<ManageGear
					incompleteFields={gearIncomplete} />
			</Section>
			<Section
				expanded={showManageWealth}
				nextExpanded={showChooseAnimalCompanion}
				incomplete={wealthIncomplete}
				showExpandButton={true}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => setShowChooseAnimalCompanion(true)}>
				<ManageWealth incompleteFields={wealthIncomplete} />
			</Section>
			<Section
				expanded={showChooseAnimalCompanion}
				nextExpanded={showWrapUp}
				incomplete={""}
				showExpandButton={true}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => setShowWrapUp(true)}>
				<ChooseAnimalCompanion incompleteFields={animalCompanionIncomplete} />
			</Section>
			<Section
				expanded={showWrapUp}
				nextExpanded={false}
				incomplete={""}
				showExpandButton={false}
				variant="dual"
				clickCheck={setClickCheck}
				expandFunction={() => { return; }}>
				<WrapUp
					buttonFunction={() => { return; }} />
			</Section>
		</div>
	);
};

export default Sections;