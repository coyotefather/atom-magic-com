/**
 * EncounterBuilder.tsx
 *
 * Top-level orchestrator for the Encounter Builder feature. Arranges a
 * two-column layout: a sidebar roster of saved encounters (`EncounterRoster`)
 * and a main editing area that contains the encounter name/party-size header,
 * the creature selector, the creature list, and the threat summary.
 *
 * All encounter data is persisted to localStorage via the functions in
 * `src/lib/encounterPersistence.ts`. The active encounter is loaded on mount
 * and saved automatically after every mutation.
 *
 * Core editing operations:
 *   - New encounter         — creates a blank `Encounter` object and saves it.
 *   - Select encounter      — loads the encounter from localStorage.
 *   - Delete encounter      — removes it from localStorage and deselects.
 *   - Rename                — updates the encounter name on every keystroke.
 *   - Party size ± buttons  — clamps between 1 and 12 players.
 *   - Add creature          — either increments the existing entry's quantity
 *                             or appends a new `EncounterCreature` row. Works
 *                             for both CMS and custom creatures.
 *   - Quantity change ± 1   — reduces to zero triggers removal.
 *   - Remove creature       — filters the creature out of the list.
 *   - Clear all creatures   — empties the creature list.
 *   - Copy summary          — generates a plain-text encounter summary
 *                             (`generateEncounterSummary`) and copies it to
 *                             the clipboard, with a "Copied!" confirmation.
 *
 * Threat calculation (from `encounter-data.ts`):
 *   - `calculateTotalThreat` — sum of each creature's threat value × quantity.
 *   - `calculateThreatPerPlayer` — total ÷ party size.
 *   - `getDifficultyRating` / `getDifficultyLabel` — converts the per-player
 *     threat to a named difficulty tier (Trivial, Easy, Moderate, Hard, Deadly).
 *
 * Custom creatures are loaded from localStorage on mount and passed to
 * `CreatureSelector`; they are not re-fetched after mount.
 *
 * Used by:
 *   - src/app/(website)/(creature-tools)/encounters/page.tsx
 */

'use client';
import { useState, useEffect, useCallback } from 'react';
import Icon from '@mdi/react';
import { mdiPlus, mdiContentCopy, mdiDelete, mdiMinus } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';
import EncounterRoster from './EncounterRoster';
import CreatureSelector from './CreatureSelector';
import EncounterCreatureList from './EncounterCreatureList';
import {
	Encounter,
	EncounterCreature,
	createNewEncounter,
	calculateTotalThreat,
	calculateThreatPerPlayer,
	getDifficultyRating,
	getDifficultyLabel,
	getDifficultyColor,
	generateEncounterSummary,
} from '@/lib/encounter-data';
import {
	getEncounterRoster,
	getEncounterById,
	saveEncounterById,
	deleteEncounterById,
	setActiveEncounter,
	copyEncounterToClipboard,
} from '@/lib/encounterPersistence';
import {
	getCreatureRoster,
	CustomCreatureSummary,
} from '@/lib/customCreaturePersistence';
import type { NormedCreature, CreatureFilters } from '@/lib/creature-types';

interface EncounterBuilderProps {
	creatures: NormedCreature[];
	filters: CreatureFilters;
}

const EncounterBuilder = ({ creatures, filters }: EncounterBuilderProps) => {
	const [encounters, setEncounters] = useState<Encounter[]>([]);
	const [activeEncounterId, setActiveEncounterId] = useState<string | null>(null);
	const [currentEncounter, setCurrentEncounter] = useState<Encounter | null>(null);
	const [copySuccess, setCopySuccess] = useState(false);
	const [customCreatures, setCustomCreatures] = useState<CustomCreatureSummary[]>([]);

	// Load roster from localStorage on mount
	useEffect(() => {
		const roster = getEncounterRoster();
		setEncounters(roster.encounters);
		setActiveEncounterId(roster.activeEncounterId);

		// Load active encounter if one exists
		if (roster.activeEncounterId) {
			const encounter = getEncounterById(roster.activeEncounterId);
			if (encounter) {
				setCurrentEncounter(encounter);
			}
		}

		// Load custom creatures from localStorage
		const creatureRoster = getCreatureRoster();
		setCustomCreatures(creatureRoster.creatures);
	}, []);

	// Save encounter when it changes
	const saveCurrentEncounter = useCallback((encounter: Encounter) => {
		saveEncounterById(encounter.id, encounter);
		// Update local state
		setEncounters(prev => {
			const idx = prev.findIndex(e => e.id === encounter.id);
			if (idx >= 0) {
				const updated = [...prev];
				updated[idx] = encounter;
				return updated;
			}
			return [...prev, encounter];
		});
	}, []);

	// Create new encounter
	const handleNewEncounter = () => {
		const newEncounter = createNewEncounter();
		setCurrentEncounter(newEncounter);
		setActiveEncounterId(newEncounter.id);
		setActiveEncounter(newEncounter.id);
		saveEncounterById(newEncounter.id, newEncounter);
		setEncounters(prev => [...prev, newEncounter]);
	};

	// Select an existing encounter
	const handleSelectEncounter = (id: string) => {
		const encounter = getEncounterById(id);
		if (encounter) {
			setCurrentEncounter(encounter);
			setActiveEncounterId(id);
			setActiveEncounter(id);
		}
	};

	// Delete an encounter
	const handleDeleteEncounter = (id: string) => {
		deleteEncounterById(id);
		setEncounters(prev => prev.filter(e => e.id !== id));

		if (activeEncounterId === id) {
			setCurrentEncounter(null);
			setActiveEncounterId(null);
		}
	};

	// Update encounter name
	const handleNameChange = (name: string) => {
		if (!currentEncounter) return;
		const updated = { ...currentEncounter, name };
		setCurrentEncounter(updated);
		saveCurrentEncounter(updated);
	};

	// Update party size
	const handlePartySizeChange = (delta: number) => {
		if (!currentEncounter) return;
		const newSize = Math.max(1, Math.min(12, currentEncounter.partySize + delta));
		const updated = { ...currentEncounter, partySize: newSize };
		setCurrentEncounter(updated);
		saveCurrentEncounter(updated);
	};

	// Add creature to encounter
	const handleAddCreature = (creature: NormedCreature) => {
		if (!currentEncounter) return;

		const existingIdx = currentEncounter.creatures.findIndex(
			c => c.creatureId === creature._id && c.source !== 'custom'
		);

		let updatedCreatures: EncounterCreature[];
		if (existingIdx >= 0) {
			// Increase quantity
			updatedCreatures = [...currentEncounter.creatures];
			updatedCreatures[existingIdx] = {
				...updatedCreatures[existingIdx],
				quantity: updatedCreatures[existingIdx].quantity + 1,
			};
		} else {
			// Add new creature
			const newCreature: EncounterCreature = {
				creatureId: creature._id,
				name: creature.name || 'Unknown',
				challengeLevel: creature.challengeLevel || 'moderate',
				quantity: 1,
				source: 'cms',
			};
			updatedCreatures = [...currentEncounter.creatures, newCreature];
		}

		const updated = { ...currentEncounter, creatures: updatedCreatures };
		setCurrentEncounter(updated);
		saveCurrentEncounter(updated);
	};

	// Add custom creature to encounter
	const handleAddCustomCreature = (creature: CustomCreatureSummary) => {
		if (!currentEncounter) return;

		const existingIdx = currentEncounter.creatures.findIndex(
			c => c.creatureId === creature.id && c.source === 'custom'
		);

		let updatedCreatures: EncounterCreature[];
		if (existingIdx >= 0) {
			updatedCreatures = [...currentEncounter.creatures];
			updatedCreatures[existingIdx] = {
				...updatedCreatures[existingIdx],
				quantity: updatedCreatures[existingIdx].quantity + 1,
			};
		} else {
			const newCreature: EncounterCreature = {
				creatureId: creature.id,
				name: creature.name || 'Unnamed Creature',
				challengeLevel: creature.challengeLevel || 'moderate',
				quantity: 1,
				source: 'custom',
			};
			updatedCreatures = [...currentEncounter.creatures, newCreature];
		}

		const updated = { ...currentEncounter, creatures: updatedCreatures };
		setCurrentEncounter(updated);
		saveCurrentEncounter(updated);
	};

	// Update creature quantity
	const handleQuantityChange = (creatureId: string, delta: number) => {
		if (!currentEncounter) return;

		const updatedCreatures = currentEncounter.creatures
			.map(c => {
				if (c.creatureId === creatureId) {
					const newQty = c.quantity + delta;
					return newQty > 0 ? { ...c, quantity: newQty } : null;
				}
				return c;
			})
			.filter((c): c is EncounterCreature => c !== null);

		const updated = { ...currentEncounter, creatures: updatedCreatures };
		setCurrentEncounter(updated);
		saveCurrentEncounter(updated);
	};

	// Remove creature from encounter
	const handleRemoveCreature = (creatureId: string) => {
		if (!currentEncounter) return;

		const updatedCreatures = currentEncounter.creatures.filter(
			c => c.creatureId !== creatureId
		);

		const updated = { ...currentEncounter, creatures: updatedCreatures };
		setCurrentEncounter(updated);
		saveCurrentEncounter(updated);
	};

	// Clear all creatures
	const handleClearAll = () => {
		if (!currentEncounter) return;
		const updated = { ...currentEncounter, creatures: [] };
		setCurrentEncounter(updated);
		saveCurrentEncounter(updated);
	};

	// Copy summary to clipboard
	const handleCopySummary = async () => {
		if (!currentEncounter) return;

		const totalThreat = calculateTotalThreat(currentEncounter.creatures);
		const threatPerPlayer = calculateThreatPerPlayer(totalThreat, currentEncounter.partySize);
		const rating = getDifficultyRating(threatPerPlayer);
		const summary = generateEncounterSummary(currentEncounter, totalThreat, rating);

		const success = await copyEncounterToClipboard(summary);
		if (success) {
			setCopySuccess(true);
			setTimeout(() => setCopySuccess(false), 2000);
		}
	};

	// Calculate current threat stats
	const totalThreat = currentEncounter
		? calculateTotalThreat(currentEncounter.creatures)
		: 0;
	const threatPerPlayer = currentEncounter
		? calculateThreatPerPlayer(totalThreat, currentEncounter.partySize)
		: 0;
	const difficultyRating = getDifficultyRating(threatPerPlayer);
	const difficultyLabel = getDifficultyLabel(difficultyRating);
	const difficultyColor = getDifficultyColor(difficultyRating);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
			{/* Left sidebar - Encounter Roster */}
			<aside className="lg:col-span-1">
				<EncounterRoster
					encounters={encounters}
					activeEncounterId={activeEncounterId}
					onSelect={handleSelectEncounter}
					onDelete={handleDeleteEncounter}
					onNew={handleNewEncounter}
				/>
			</aside>

			{/* Main content - Encounter Editor */}
			<main className="lg:col-span-3">
				{currentEncounter ? (
					<div className="space-y-6">
						{/* Encounter header */}
						<div className="bg-parchment border-2 border-stone p-6">
							<div className="flex flex-wrap items-start justify-between gap-4">
								<div className="flex-1 min-w-[200px]">
									<label className="block text-xs text-stone uppercase tracking-wider mb-2">
										Encounter Name
									</label>
									<input
										type="text"
										value={currentEncounter.name}
										onChange={e => handleNameChange(e.target.value)}
										className="w-full px-4 py-2 border-2 border-stone bg-white marcellus text-xl focus:border-bronze focus:outline-none"
										placeholder="Enter encounter name..."
									/>
								</div>
								<div>
									<label className="block text-xs text-stone uppercase tracking-wider mb-2">
										Party Size
									</label>
									<div className="flex items-center gap-2">
										<FunctionButton
											variant="secondary"
											size="sm"
											onClick={() => handlePartySizeChange(-1)}
											isDisabled={currentEncounter.partySize <= 1}
											icon={mdiMinus}
											isIconOnly
											className="w-10 h-10 px-0 border-stone"
										/>
										<span className="w-10 text-center marcellus text-xl">
											{currentEncounter.partySize}
										</span>
										<FunctionButton
											variant="secondary"
											size="sm"
											onClick={() => handlePartySizeChange(1)}
											isDisabled={currentEncounter.partySize >= 12}
											icon={mdiPlus}
											isIconOnly
											className="w-10 h-10 px-0 border-stone"
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Creature selector */}
						<CreatureSelector
							creatures={creatures}
							filters={filters}
							onAddCreature={handleAddCreature}
							customCreatures={customCreatures}
							onAddCustomCreature={handleAddCustomCreature}
						/>

						{/* Current encounter creatures */}
						<EncounterCreatureList
							creatures={currentEncounter.creatures}
							onQuantityChange={handleQuantityChange}
							onRemove={handleRemoveCreature}
						/>

						{/* Threat summary */}
						<div className="bg-black text-white p-6">
							<div className="flex flex-wrap items-center justify-between gap-4">
								<div>
									<span className="text-stone-light text-sm">Total Threat:</span>
									<span className="ml-2 marcellus text-2xl text-bronze">
										{totalThreat}
									</span>
								</div>
								<div className="text-center">
									<span className={`marcellus text-2xl uppercase ${difficultyColor}`}>
										{difficultyLabel}
									</span>
									<span className="text-stone-light text-sm block">
										for {currentEncounter.partySize} player{currentEncounter.partySize !== 1 ? 's' : ''}
									</span>
								</div>
								<div className="flex gap-2">
									{currentEncounter.creatures.length > 0 && (
										<FunctionButton
											variant="ghost"
											size="sm"
											onClick={handleClearAll}
											icon={mdiDelete}
											className="border border-stone-light text-stone-light hover:border-oxblood hover:text-oxblood"
										>
											Clear All
										</FunctionButton>
									)}
									<FunctionButton
										variant="primary"
										size="sm"
										onClick={handleCopySummary}
										isDisabled={currentEncounter.creatures.length === 0}
										icon={mdiContentCopy}
										className="bg-bronze hover:bg-gold"
									>
										{copySuccess ? 'Copied!' : 'Copy Summary'}
									</FunctionButton>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="bg-parchment border-2 border-stone p-12 text-center">
						<Icon
							path={mdiPlus}
							size={3}
							className="mx-auto text-stone/30 mb-4"
						/>
						<p className="text-stone mb-4">
							Select an existing encounter or create a new one to get started.
						</p>
						<FunctionButton
							variant="primary"
							onClick={handleNewEncounter}
							className="bg-bronze hover:bg-gold"
						>
							New Encounter
						</FunctionButton>
					</div>
				)}
			</main>
		</div>
	);
};

export default EncounterBuilder;
