'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks';
import { loadCharacter } from '@/lib/slices/characterSlice';
import {
	generateCharacter,
	GeneratorOptions,
	GeneratorData,
	LockedFields,
} from '@/lib/character-generator';
import { ARCHETYPES } from '@/lib/archetype-data';
import {
	createNewCharacterId,
	saveCharacterById,
	setActiveCharacter,
	CharacterSummary,
} from '@/lib/characterPersistence';
import { calculateGearShieldBonuses, getArmorCapacity } from '@/lib/utils/shield';
import { calculateScoreAverage } from '@/lib/utils/score';
import { CharacterState } from '@/lib/slices/characterSlice';
import CharacterSummaryCard from './CharacterSummaryCard';
import FunctionButton from '@/app/components/common/FunctionButton';
import Icon from '@mdi/react';
import {
	mdiDice6,
	mdiLock,
	mdiLockOpen,
	mdiContentSave,
	mdiPencil,
	mdiShuffle,
} from '@mdi/js';

import {
	CULTURES_QUERY_RESULT,
	PATHS_QUERY_RESULT,
	PATRONAGES_QUERY_RESULT,
	DISCIPLINES_QUERY_RESULT,
	SCORES_QUERY_RESULT,
} from '../../../../sanity.types';

interface CharacterGeneratorProps {
	cultures: CULTURES_QUERY_RESULT;
	paths: PATHS_QUERY_RESULT;
	patronages: PATRONAGES_QUERY_RESULT;
	disciplines: DISCIPLINES_QUERY_RESULT;
	scores: SCORES_QUERY_RESULT;
}

type GeneratorMode = 'easy' | 'advanced';

// Consolidated lock state for advanced mode
interface LockState {
	culture: { locked: boolean; value: string };
	path: { locked: boolean; value: string };
	patronage: { locked: boolean; value: string };
}

const initialLockState: LockState = {
	culture: { locked: false, value: '' },
	path: { locked: false, value: '' },
	patronage: { locked: false, value: '' },
};

const CharacterGenerator = ({
	cultures,
	paths,
	patronages,
	disciplines,
	scores,
}: CharacterGeneratorProps) => {
	const router = useRouter();
	const dispatch = useAppDispatch();

	// Generator state
	const [mode, setMode] = useState<GeneratorMode>('easy');
	const [archetype, setArchetype] = useState<string>('any');
	const [pathPreference, setPathPreference] = useState<string>('');
	const [locks, setLocks] = useState<LockState>(initialLockState);

	// Generated character
	const [generatedCharacter, setGeneratedCharacter] = useState<CharacterState | null>(null);
	const [isSaved, setIsSaved] = useState(false);

	// Prepare generator data
	const generatorData: GeneratorData = useMemo(() => ({
		cultures,
		paths,
		patronages,
		disciplines,
		scores,
	}), [cultures, paths, patronages, disciplines, scores]);

	// Build a CharacterSummary for the preview card
	const characterSummary: CharacterSummary | null = useMemo(() => {
		if (!generatedCharacter) return null;

		const physicalScore = generatedCharacter.scores.find(s => s.title === 'Physical');
		const psycheScore = generatedCharacter.scores.find(s => s.title === 'Psyche');
		const physicalAvg = calculateScoreAverage(physicalScore?.subscores);
		const psycheAvg = calculateScoreAverage(psycheScore?.subscores);

		const { physicalShieldBonus, psychicShieldBonus } = calculateGearShieldBonuses(generatedCharacter.gear);
		const armorCapacity = getArmorCapacity(generatedCharacter.gear);

		const cultureName = cultures.find(c => c._id === generatedCharacter.culture)?.title || '';
		const pathName = paths.find(p => p._id === generatedCharacter.path)?.title || '';
		const patronageName = patronages.find(p => p._id === generatedCharacter.patronage)?.title || '';

		return {
			id: 'preview',
			name: generatedCharacter.name || 'Generated Character',
			culture: cultureName,
			path: pathName,
			patronage: patronageName,
			physicalShield: physicalAvg + physicalShieldBonus,
			psychicShield: psycheAvg + psychicShieldBonus,
			armorCapacity,
			disciplineCount: generatedCharacter.disciplines.length,
			techniqueCount: generatedCharacter.techniques.length,
			isComplete: true,
			lastModified: new Date().toISOString(),
		};
	}, [generatedCharacter, cultures, paths, patronages]);

	// Memoize discipline names for preview
	const disciplineNames = useMemo(() => {
		if (!generatedCharacter) return [];
		return generatedCharacter.disciplines.map(id => {
			const disc = disciplines.find(d => d._id === id);
			return disc?.title || id;
		});
	}, [generatedCharacter, disciplines]);

	// Memoize technique names for preview
	const techniqueNames = useMemo(() => {
		if (!generatedCharacter) return [];
		return generatedCharacter.techniques.map(id => {
			for (const disc of disciplines) {
				const tech = disc.techniques?.find(t => t._id === id);
				if (tech) return tech.title || id;
			}
			return id;
		});
	}, [generatedCharacter, disciplines]);

	// Memoize gear summary for preview
	const gearSummary = useMemo(() => {
		if (!generatedCharacter) return [];
		return generatedCharacter.gear.map(g => {
			let name = g.name;
			if (g.enhancement) {
				name += ` (${g.enhancement.name})`;
			}
			return name;
		});
	}, [generatedCharacter]);

	// Get selected archetype description
	const selectedArchetype = useMemo(() =>
		ARCHETYPES.find(a => a.id === archetype),
		[archetype]
	);

	// Toggle lock for a field
	const toggleLock = useCallback((field: keyof LockState) => {
		setLocks(prev => ({
			...prev,
			[field]: { ...prev[field], locked: !prev[field].locked }
		}));
	}, []);

	// Update locked value for a field
	const updateLockValue = useCallback((field: keyof LockState, value: string) => {
		setLocks(prev => ({
			...prev,
			[field]: { ...prev[field], value }
		}));
	}, []);

	// Generate a character
	const handleGenerate = useCallback(() => {
		const lockedFields: LockedFields = {};

		if (mode === 'advanced') {
			if (locks.culture.locked && locks.culture.value) lockedFields.culture = locks.culture.value;
			if (locks.path.locked && locks.path.value) lockedFields.path = locks.path.value;
			if (locks.patronage.locked && locks.patronage.value) lockedFields.patronage = locks.patronage.value;
		}

		const options: GeneratorOptions = {
			mode,
			archetype: mode === 'easy' ? archetype : undefined,
			lockedFields: mode === 'advanced' ? lockedFields : undefined,
			pathPreference: pathPreference || undefined,
		};

		const character = generateCharacter(options, generatorData);
		setGeneratedCharacter(character);
		setIsSaved(false);
	}, [mode, archetype, pathPreference, locks, generatorData]);

	// Save character to roster
	const handleSave = useCallback(() => {
		if (!generatedCharacter) return;

		const id = createNewCharacterId();
		saveCharacterById(id, generatedCharacter);
		setActiveCharacter(id);
		setIsSaved(true);
	}, [generatedCharacter]);

	// Open in character manager for editing
	const handleEdit = useCallback(() => {
		if (!generatedCharacter) return;

		if (!isSaved) {
			const id = createNewCharacterId();
			saveCharacterById(id, generatedCharacter);
			setActiveCharacter(id);
		}

		dispatch(loadCharacter({ ...generatedCharacter, loaded: true }));
		router.push('/character');
	}, [generatedCharacter, isSaved, dispatch, router]);

	return (
		<div className="container px-6 md:px-8 py-8">
			{/* Header */}
			<div className="mb-8">
				<h1 className="marcellus text-3xl md:text-4xl text-black dark:text-parchment mb-2">
					Character Generator
				</h1>
				<p className="text-stone dark:text-stone-light">
					Quickly generate characters for NPCs or as a starting point for your own creations.
				</p>
			</div>

			{/* Mode Toggle */}
			<div className="flex gap-4 mb-8">
				<FunctionButton
					variant="tab"
					isActive={mode === 'easy'}
					onClick={() => setMode('easy')}
				>
					Easy Mode
				</FunctionButton>
				<FunctionButton
					variant="tab"
					isActive={mode === 'advanced'}
					onClick={() => setMode('advanced')}
				>
					Advanced Mode
				</FunctionButton>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Options Panel */}
				<div className="border-2 border-stone/30 dark:border-stone-dark p-6">
					<h2 className="marcellus text-xl text-black dark:text-parchment mb-4">
						{mode === 'easy' ? 'Quick Generation' : 'Lock & Randomize'}
					</h2>

					{mode === 'easy' ? (
						<div className="space-y-6">
							<p className="text-sm text-stone dark:text-stone-light mb-4">
								Select an archetype to influence the character&apos;s disciplines, techniques, and scores.
							</p>

							{/* Archetype Selection */}
							<div>
								<label className="block text-sm font-medium text-stone-dark dark:text-stone-light mb-2">
									Archetype
								</label>
								<select
									value={archetype}
									onChange={(e) => setArchetype(e.target.value)}
									className="w-full p-3 border-2 border-stone/30 dark:border-stone-dark bg-white dark:bg-black/20 text-black dark:text-parchment focus:border-gold outline-none"
								>
									{ARCHETYPES.map((arch) => (
										<option key={arch.id} value={arch.id}>
											{arch.name}
										</option>
									))}
								</select>
								{selectedArchetype && selectedArchetype.id !== 'any' && (
									<p className="mt-2 text-sm text-stone dark:text-stone-light">
										{selectedArchetype.description}
									</p>
								)}
							</div>

							{/* Path Preference (Optional) */}
							<div>
								<label className="block text-sm font-medium text-stone-dark dark:text-stone-light mb-2">
									Path Preference (Optional)
								</label>
								<select
									value={pathPreference}
									onChange={(e) => setPathPreference(e.target.value)}
									className="w-full p-3 border-2 border-stone/30 dark:border-stone-dark bg-white dark:bg-black/20 text-black dark:text-parchment focus:border-gold outline-none"
								>
									<option value="">Any Path</option>
									{paths.map((path) => (
										<option key={path._id} value={path._id}>
											{path.title}
										</option>
									))}
								</select>
							</div>
						</div>
					) : (
						<div className="space-y-6">
							<p className="text-sm text-stone dark:text-stone-light mb-4">
								Lock specific choices to keep them fixed, or leave unlocked to randomize.
							</p>

							{/* Culture Lock */}
							<div className="flex items-center gap-3">
								<FunctionButton
									variant="toggle"
									isActive={locks.culture.locked}
									onClick={() => toggleLock('culture')}
									icon={locks.culture.locked ? mdiLock : mdiLockOpen}
									title={locks.culture.locked ? 'Unlock culture' : 'Lock culture'}
								/>
								<div className="flex-1">
									<label className="block text-sm font-medium text-stone-dark dark:text-stone-light mb-1">
										Culture
									</label>
									<select
										value={locks.culture.value}
										onChange={(e) => updateLockValue('culture', e.target.value)}
										disabled={!locks.culture.locked}
										className={`w-full p-2 border-2 border-stone/30 dark:border-stone-dark bg-white dark:bg-black/20 text-black dark:text-parchment focus:border-gold outline-none ${
											!locks.culture.locked ? 'opacity-50' : ''
										}`}
									>
										<option value="">Select culture...</option>
										{cultures.map((culture) => (
											<option key={culture._id} value={culture._id}>
												{culture.title}
											</option>
										))}
									</select>
								</div>
							</div>

							{/* Path Lock */}
							<div className="flex items-center gap-3">
								<FunctionButton
									variant="toggle"
									isActive={locks.path.locked}
									onClick={() => toggleLock('path')}
									icon={locks.path.locked ? mdiLock : mdiLockOpen}
									title={locks.path.locked ? 'Unlock path' : 'Lock path'}
								/>
								<div className="flex-1">
									<label className="block text-sm font-medium text-stone-dark dark:text-stone-light mb-1">
										Path
									</label>
									<select
										value={locks.path.value}
										onChange={(e) => updateLockValue('path', e.target.value)}
										disabled={!locks.path.locked}
										className={`w-full p-2 border-2 border-stone/30 dark:border-stone-dark bg-white dark:bg-black/20 text-black dark:text-parchment focus:border-gold outline-none ${
											!locks.path.locked ? 'opacity-50' : ''
										}`}
									>
										<option value="">Select path...</option>
										{paths.map((path) => (
											<option key={path._id} value={path._id}>
												{path.title}
											</option>
										))}
									</select>
								</div>
							</div>

							{/* Patronage Lock */}
							<div className="flex items-center gap-3">
								<FunctionButton
									variant="toggle"
									isActive={locks.patronage.locked}
									onClick={() => toggleLock('patronage')}
									icon={locks.patronage.locked ? mdiLock : mdiLockOpen}
									title={locks.patronage.locked ? 'Unlock patronage' : 'Lock patronage'}
								/>
								<div className="flex-1">
									<label className="block text-sm font-medium text-stone-dark dark:text-stone-light mb-1">
										Patronage
									</label>
									<select
										value={locks.patronage.value}
										onChange={(e) => updateLockValue('patronage', e.target.value)}
										disabled={!locks.patronage.locked}
										className={`w-full p-2 border-2 border-stone/30 dark:border-stone-dark bg-white dark:bg-black/20 text-black dark:text-parchment focus:border-gold outline-none ${
											!locks.patronage.locked ? 'opacity-50' : ''
										}`}
									>
										<option value="">Select patronage...</option>
										{patronages.map((patronage) => (
											<option key={patronage._id} value={patronage._id}>
												{patronage.title}
											</option>
										))}
									</select>
								</div>
							</div>

							{/* Archetype (influences disciplines/techniques) */}
							<div>
								<label className="block text-sm font-medium text-stone-dark dark:text-stone-light mb-2">
									Archetype Influence (Optional)
								</label>
								<select
									value={archetype}
									onChange={(e) => setArchetype(e.target.value)}
									className="w-full p-3 border-2 border-stone/30 dark:border-stone-dark bg-white dark:bg-black/20 text-black dark:text-parchment focus:border-gold outline-none"
								>
									{ARCHETYPES.map((arch) => (
										<option key={arch.id} value={arch.id}>
											{arch.name}
										</option>
									))}
								</select>
								<p className="mt-1 text-xs text-stone dark:text-stone-light">
									Influences discipline and technique selection
								</p>
							</div>
						</div>
					)}

					{/* Generate Button */}
					<FunctionButton
						variant="danger"
						size="lg"
						fullWidth
						onClick={handleGenerate}
						icon={mdiShuffle}
						className="mt-6"
					>
						{generatedCharacter ? 'Generate Again' : 'Generate Character'}
					</FunctionButton>
				</div>

				{/* Preview Panel */}
				<div className="border-2 border-stone/30 dark:border-stone-dark p-6">
					<h2 className="marcellus text-xl text-black dark:text-parchment mb-4">
						Preview
					</h2>

					{generatedCharacter && characterSummary ? (
						<div className="space-y-6">
							{/* Summary Card */}
							<CharacterSummaryCard character={characterSummary} />

							{/* Extended Details */}
							<div className="space-y-4 text-sm">
								{/* Disciplines */}
								<div>
									<h3 className="font-semibold text-stone-dark dark:text-stone-light mb-1">
										Disciplines
									</h3>
									<p className="text-stone dark:text-stone-light">
										{disciplineNames.join(', ') || 'None'}
									</p>
								</div>

								{/* Techniques */}
								<div>
									<h3 className="font-semibold text-stone-dark dark:text-stone-light mb-1">
										Techniques
									</h3>
									<p className="text-stone dark:text-stone-light">
										{techniqueNames.join(', ') || 'None'}
									</p>
								</div>

								{/* Gear */}
								<div>
									<h3 className="font-semibold text-stone-dark dark:text-stone-light mb-1">
										Gear
									</h3>
									<p className="text-stone dark:text-stone-light">
										{gearSummary.join(', ') || 'None'}
									</p>
								</div>

								{/* Wealth */}
								<div>
									<h3 className="font-semibold text-stone-dark dark:text-stone-light mb-1">
										Wealth
									</h3>
									<p className="text-stone dark:text-stone-light">
										{generatedCharacter.wealth.silver} Silver,{' '}
										{generatedCharacter.wealth.gold} Gold,{' '}
										{generatedCharacter.wealth.lead} Lead,{' '}
										{generatedCharacter.wealth.uranium} Uranium
									</p>
								</div>

								{/* Animal Companion */}
								{generatedCharacter.animalCompanion.name && (
									<div>
										<h3 className="font-semibold text-stone-dark dark:text-stone-light mb-1">
											Animal Companion
										</h3>
										<p className="text-stone dark:text-stone-light">
											{generatedCharacter.animalCompanion.name}
										</p>
									</div>
								)}

								{/* Scores Summary */}
								<div>
									<h3 className="font-semibold text-stone-dark dark:text-stone-light mb-1">
										Scores
									</h3>
									<div className="grid grid-cols-2 gap-2">
										{generatedCharacter.scores.map(score => (
											<div key={score._id} className="text-stone dark:text-stone-light">
												<span className="font-medium">{score.title}:</span> {score.value}
											</div>
										))}
									</div>
								</div>
							</div>

							{/* Actions */}
							<div className="flex gap-4 pt-4 border-t border-stone/20 dark:border-stone-dark">
								<FunctionButton
									variant={isSaved ? 'secondary' : 'primary'}
									onClick={handleSave}
									isDisabled={isSaved}
									icon={mdiContentSave}
									className={`flex-1 ${isSaved ? 'bg-laurel/20 text-laurel border-laurel hover:bg-laurel/20' : ''}`}
								>
									{isSaved ? 'Saved!' : 'Save to Roster'}
								</FunctionButton>
								<FunctionButton
									variant="secondary"
									onClick={handleEdit}
									icon={mdiPencil}
									className="flex-1 border-stone text-stone hover:border-gold hover:text-gold dark:border-stone-light dark:text-stone-light"
								>
									Edit in Manager
								</FunctionButton>
							</div>
						</div>
					) : (
						<div className="text-center py-12 text-stone dark:text-stone-light">
							<Icon path={mdiDice6} size={3} className="mx-auto mb-4 opacity-30" />
							<p>Click &quot;Generate Character&quot; to create a new character.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CharacterGenerator;
