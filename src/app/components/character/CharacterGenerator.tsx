'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks';
import { loadCharacter } from '@/lib/slices/characterSlice';
import {
	generateCharacter,
	GeneratorOptions,
	GeneratorData,
	LockedFields,
} from '@/lib/character-generator';
import { ARCHETYPES, Archetype } from '@/lib/archetype-data';
import {
	createNewCharacterId,
	saveCharacterById,
	setActiveCharacter,
	CharacterSummary,
} from '@/lib/characterPersistence';
import { calculateGearShieldBonuses, getArmorCapacity } from '@/lib/utils/shield';
import { CharacterState } from '@/lib/slices/characterSlice';
import CharacterSummaryCard from './CharacterSummaryCard';
import Icon from '@mdi/react';
import {
	mdiDice6,
	mdiLock,
	mdiLockOpen,
	mdiRefresh,
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

	// Advanced mode locks
	const [lockedCulture, setLockedCulture] = useState<string>('');
	const [lockedPath, setLockedPath] = useState<string>('');
	const [lockedPatronage, setLockedPatronage] = useState<string>('');
	const [isCultureLocked, setIsCultureLocked] = useState(false);
	const [isPathLocked, setIsPathLocked] = useState(false);
	const [isPatronageLocked, setIsPatronageLocked] = useState(false);

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

		// Calculate shield values
		const physicalScore = generatedCharacter.scores.find(s => s.title === 'Physical');
		const psycheScore = generatedCharacter.scores.find(s => s.title === 'Psyche');
		const physicalAvg = physicalScore?.subscores?.length
			? Math.round(physicalScore.subscores.reduce((sum, sub) => sum + (sub.value || 0), 0) / physicalScore.subscores.length)
			: 0;
		const psycheAvg = psycheScore?.subscores?.length
			? Math.round(psycheScore.subscores.reduce((sum, sub) => sum + (sub.value || 0), 0) / psycheScore.subscores.length)
			: 0;

		// Get gear bonuses
		const { physicalShieldBonus, psychicShieldBonus } = calculateGearShieldBonuses(generatedCharacter.gear);
		const armorCapacity = getArmorCapacity(generatedCharacter.gear);

		// Resolve IDs to names for display
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

	// Generate a character
	const handleGenerate = () => {
		const lockedFields: LockedFields = {};

		if (mode === 'advanced') {
			if (isCultureLocked && lockedCulture) lockedFields.culture = lockedCulture;
			if (isPathLocked && lockedPath) lockedFields.path = lockedPath;
			if (isPatronageLocked && lockedPatronage) lockedFields.patronage = lockedPatronage;
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
	};

	// Save character to roster
	const handleSave = () => {
		if (!generatedCharacter) return;

		const id = createNewCharacterId();
		saveCharacterById(id, generatedCharacter);
		setActiveCharacter(id);
		setIsSaved(true);
	};

	// Open in character manager for editing
	const handleEdit = () => {
		if (!generatedCharacter) return;

		// Save if not already saved
		if (!isSaved) {
			const id = createNewCharacterId();
			saveCharacterById(id, generatedCharacter);
			setActiveCharacter(id);
		}

		// Load into Redux and navigate
		dispatch(loadCharacter({ ...generatedCharacter, loaded: true }));
		router.push('/character');
	};

	// Get archetype description
	const selectedArchetype = ARCHETYPES.find(a => a.id === archetype);

	// Get discipline names for preview
	const getDisciplineNames = () => {
		if (!generatedCharacter) return [];
		return generatedCharacter.disciplines.map(id => {
			const disc = disciplines.find(d => d._id === id);
			return disc?.title || id;
		});
	};

	// Get technique names for preview
	const getTechniqueNames = () => {
		if (!generatedCharacter) return [];
		return generatedCharacter.techniques.map(id => {
			for (const disc of disciplines) {
				const tech = disc.techniques?.find(t => t._id === id);
				if (tech) return tech.title || id;
			}
			return id;
		});
	};

	// Get gear summary
	const getGearSummary = () => {
		if (!generatedCharacter) return [];
		return generatedCharacter.gear.map(g => {
			let name = g.name;
			if (g.enhancement) {
				name += ` (${g.enhancement.name})`;
			}
			return name;
		});
	};

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
				<button
					onClick={() => setMode('easy')}
					className={`
						px-6 py-3 marcellus uppercase tracking-wider text-sm
						transition-all border-2
						${mode === 'easy'
							? 'bg-gold text-white border-gold'
							: 'border-stone/30 text-stone hover:border-stone dark:border-stone-dark dark:text-stone-light dark:hover:border-stone-light'
						}
					`}
				>
					Easy Mode
				</button>
				<button
					onClick={() => setMode('advanced')}
					className={`
						px-6 py-3 marcellus uppercase tracking-wider text-sm
						transition-all border-2
						${mode === 'advanced'
							? 'bg-gold text-white border-gold'
							: 'border-stone/30 text-stone hover:border-stone dark:border-stone-dark dark:text-stone-light dark:hover:border-stone-light'
						}
					`}
				>
					Advanced Mode
				</button>
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
								<button
									onClick={() => setIsCultureLocked(!isCultureLocked)}
									className={`p-2 border-2 transition-colors ${
										isCultureLocked
											? 'border-gold bg-gold/10 text-gold'
											: 'border-stone/30 text-stone hover:border-stone dark:border-stone-dark dark:text-stone-light'
									}`}
									title={isCultureLocked ? 'Unlock culture' : 'Lock culture'}
								>
									<Icon path={isCultureLocked ? mdiLock : mdiLockOpen} size={0.875} />
								</button>
								<div className="flex-1">
									<label className="block text-sm font-medium text-stone-dark dark:text-stone-light mb-1">
										Culture
									</label>
									<select
										value={lockedCulture}
										onChange={(e) => setLockedCulture(e.target.value)}
										disabled={!isCultureLocked}
										className={`w-full p-2 border-2 border-stone/30 dark:border-stone-dark bg-white dark:bg-black/20 text-black dark:text-parchment focus:border-gold outline-none ${
											!isCultureLocked ? 'opacity-50' : ''
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
								<button
									onClick={() => setIsPathLocked(!isPathLocked)}
									className={`p-2 border-2 transition-colors ${
										isPathLocked
											? 'border-gold bg-gold/10 text-gold'
											: 'border-stone/30 text-stone hover:border-stone dark:border-stone-dark dark:text-stone-light'
									}`}
									title={isPathLocked ? 'Unlock path' : 'Lock path'}
								>
									<Icon path={isPathLocked ? mdiLock : mdiLockOpen} size={0.875} />
								</button>
								<div className="flex-1">
									<label className="block text-sm font-medium text-stone-dark dark:text-stone-light mb-1">
										Path
									</label>
									<select
										value={lockedPath}
										onChange={(e) => setLockedPath(e.target.value)}
										disabled={!isPathLocked}
										className={`w-full p-2 border-2 border-stone/30 dark:border-stone-dark bg-white dark:bg-black/20 text-black dark:text-parchment focus:border-gold outline-none ${
											!isPathLocked ? 'opacity-50' : ''
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
								<button
									onClick={() => setIsPatronageLocked(!isPatronageLocked)}
									className={`p-2 border-2 transition-colors ${
										isPatronageLocked
											? 'border-gold bg-gold/10 text-gold'
											: 'border-stone/30 text-stone hover:border-stone dark:border-stone-dark dark:text-stone-light'
									}`}
									title={isPatronageLocked ? 'Unlock patronage' : 'Lock patronage'}
								>
									<Icon path={isPatronageLocked ? mdiLock : mdiLockOpen} size={0.875} />
								</button>
								<div className="flex-1">
									<label className="block text-sm font-medium text-stone-dark dark:text-stone-light mb-1">
										Patronage
									</label>
									<select
										value={lockedPatronage}
										onChange={(e) => setLockedPatronage(e.target.value)}
										disabled={!isPatronageLocked}
										className={`w-full p-2 border-2 border-stone/30 dark:border-stone-dark bg-white dark:bg-black/20 text-black dark:text-parchment focus:border-gold outline-none ${
											!isPatronageLocked ? 'opacity-50' : ''
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
					<button
						onClick={handleGenerate}
						className="w-full mt-6 px-6 py-4 bg-oxblood hover:bg-oxblood-dark text-white marcellus uppercase tracking-wider text-sm transition-colors flex items-center justify-center gap-2"
					>
						<Icon path={mdiShuffle} size={0.875} />
						{generatedCharacter ? 'Generate Again' : 'Generate Character'}
					</button>
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
										{getDisciplineNames().join(', ') || 'None'}
									</p>
								</div>

								{/* Techniques */}
								<div>
									<h3 className="font-semibold text-stone-dark dark:text-stone-light mb-1">
										Techniques
									</h3>
									<p className="text-stone dark:text-stone-light">
										{getTechniqueNames().join(', ') || 'None'}
									</p>
								</div>

								{/* Gear */}
								<div>
									<h3 className="font-semibold text-stone-dark dark:text-stone-light mb-1">
										Gear
									</h3>
									<p className="text-stone dark:text-stone-light">
										{getGearSummary().join(', ') || 'None'}
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
								<button
									onClick={handleSave}
									disabled={isSaved}
									className={`flex-1 px-4 py-3 marcellus uppercase tracking-wider text-sm transition-colors flex items-center justify-center gap-2 ${
										isSaved
											? 'bg-laurel/20 text-laurel border-2 border-laurel cursor-default'
											: 'bg-gold hover:bg-gold-dark text-white'
									}`}
								>
									<Icon path={mdiContentSave} size={0.875} />
									{isSaved ? 'Saved!' : 'Save to Roster'}
								</button>
								<button
									onClick={handleEdit}
									className="flex-1 px-4 py-3 border-2 border-stone text-stone hover:border-gold hover:text-gold dark:border-stone-light dark:text-stone-light dark:hover:border-gold dark:hover:text-gold marcellus uppercase tracking-wider text-sm transition-colors flex items-center justify-center gap-2"
								>
									<Icon path={mdiPencil} size={0.875} />
									Edit in Manager
								</button>
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
