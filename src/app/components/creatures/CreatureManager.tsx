/**
 * CreatureManager.tsx
 *
 * Top-level orchestrator for the custom creature creation and editing feature.
 * Arranges a two-column layout: a sidebar roster of all locally-saved custom
 * creatures (`CustomCreatureRoster`) and a main editor pane
 * (`CustomCreatureEditor`). When no creature is selected, a prompt with a
 * "New Creature" button is shown in place of the editor.
 *
 * The component handles four workflows:
 *
 *   1. New creature — generates a UUID, creates a blank `CustomCreatureState`,
 *      persists it to localStorage via `saveCreatureById`, and loads it into
 *      the Redux `customCreature` slice.
 *
 *   2. Select existing — loads the creature data from localStorage into Redux
 *      so the editor reflects the chosen creature.
 *
 *   3. Clone from CMS — copies a `NormedCreature` from the Payload CMS into a
 *      new `CustomCreatureState`, preserving all stats and recording `basedOnId`
 *      for the "Based on" reference link in the editor. This can be triggered
 *      either via the "Start from Existing" button (which opens `CreaturePicker`)
 *      or via the `?clone=<id>` URL query parameter (e.g., coming from the
 *      "Customize" link on a `CreatureCard`). The URL parameter is only
 *      processed once per mount via a `useRef` guard.
 *
 *   4. Delete — removes the creature from localStorage, clears Redux state,
 *      and deselects it.
 *
 * A `rosterKey` integer is incremented after any mutation to force
 * `CustomCreatureRoster` to re-mount and re-read localStorage, since the
 * roster does not subscribe to Redux.
 *
 * Wrapped in `<Suspense>` because it uses `useSearchParams()` (which reads the
 * `?clone` URL parameter), which requires a Suspense boundary in Next.js App
 * Router.
 *
 * Used by:
 *   - src/app/(website)/(creature-tools)/creatures/manager/page.tsx
 */

'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js';
import { useAppDispatch } from '@/lib/hooks';
import {
	loadCreature,
	clearCreature,
	CustomCreatureState,
} from '@/lib/slices/customCreatureSlice';
import {
	saveCreatureById,
	deleteCreatureById,
	setActiveCreature,
	createNewCreatureId,
} from '@/lib/customCreaturePersistence';
import FunctionButton from '@/app/components/common/FunctionButton';
import CustomCreatureRoster from './CustomCreatureRoster';
import CustomCreatureEditor from './CustomCreatureEditor';
import CreaturePicker from './CreaturePicker';
import type { NormedCreature, CreatureFilters } from '@/lib/creature-types';

interface CreatureManagerProps {
	creatures: NormedCreature[];
	filters: CreatureFilters;
}

const initialCreature: CustomCreatureState = {
	loaded: false,
	id: '',
	name: '',
	description: '',
	physical: 10,
	interpersonal: 10,
	intellect: 10,
	psyche: 10,
	health: 10,
	physicalShield: 0,
	psychicShield: 0,
	armorCapacity: 0,
	attacks: [],
	specialAbilities: [],
	challengeLevel: 'moderate',
	creatureType: '',
	environments: [],
	isSwarm: false,
	isUnique: false,
	basedOnId: null,
	basedOnName: null,
	lastModified: '',
};

const CreatureManagerInner = ({ creatures, filters }: CreatureManagerProps) => {
	const dispatch = useAppDispatch();
	const searchParams = useSearchParams();
	const cloneId = searchParams.get('clone');
	const cloneProcessed = useRef(false);

	const [activeCreatureId, setActiveCreatureId] = useState<string | null>(null);
	const [rosterKey, setRosterKey] = useState(0);
	const [showPicker, setShowPicker] = useState(false);

	// Handle ?clone={creatureId} URL parameter
	useEffect(() => {
		if (cloneId && !cloneProcessed.current && creatures) {
			cloneProcessed.current = true;
			const sourceCreature = creatures.find((c) => c._id === cloneId);
			if (sourceCreature) {
				handleCloneFromCMS(sourceCreature);
			}
		}
	}, [cloneId, creatures]);

	const handleCloneFromCMS = (cmsCreature: NormedCreature) => {
		const newId = createNewCreatureId();

		const newCreature: CustomCreatureState = {
			loaded: true,
			id: newId,
			name: cmsCreature.name || '',
			description: cmsCreature.description || '',
			physical: cmsCreature.physical ?? 10,
			interpersonal: cmsCreature.interpersonal ?? 10,
			intellect: cmsCreature.intellect ?? 10,
			psyche: cmsCreature.psyche ?? 10,
			health: cmsCreature.health ?? 10,
			physicalShield: cmsCreature.physicalShield ?? 0,
			psychicShield: cmsCreature.psychicShield ?? 0,
			armorCapacity: cmsCreature.armorCapacity ?? 0,
			attacks: (cmsCreature.attacks || []).map((a) => ({
				id: crypto.randomUUID(),
				name: a.name || '',
				damage: a.damage || '',
			})),
			specialAbilities: (cmsCreature.specialAbilities || []).map((a) => ({
				id: crypto.randomUUID(),
				name: a.name || '',
				description: a.description || '',
			})),
			challengeLevel: cmsCreature.challengeLevel || 'moderate',
			creatureType: cmsCreature.creatureType || '',
			environments: cmsCreature.environments || [],
			isSwarm: cmsCreature.isSwarm || false,
			isUnique: cmsCreature.isUnique || false,
			basedOnId: cmsCreature._id,
			basedOnName: cmsCreature.name || null,
			lastModified: new Date().toISOString(),
		};

		dispatch(loadCreature(newCreature));
		saveCreatureById(newId, newCreature);
		setActiveCreature(newId);
		setActiveCreatureId(newId);
		setRosterKey((prev) => prev + 1);
		setShowPicker(false);
	};

	const handleNewCreature = () => {
		const newId = createNewCreatureId();
		const newCreature: CustomCreatureState = {
			...initialCreature,
			id: newId,
			loaded: true,
			lastModified: new Date().toISOString(),
		};

		dispatch(clearCreature());
		dispatch(loadCreature(newCreature));
		saveCreatureById(newId, newCreature);
		setActiveCreature(newId);
		setActiveCreatureId(newId);
		setRosterKey((prev) => prev + 1);
	};

	const handleCreatureSelected = (id: string) => {
		setActiveCreatureId(id);
	};

	const handleDeleteCreature = () => {
		if (!activeCreatureId) return;

		deleteCreatureById(activeCreatureId);
		dispatch(clearCreature());
		setActiveCreatureId(null);
		setRosterKey((prev) => prev + 1);
	};

	return (
		<>
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				{/* Left sidebar - Creature Roster */}
				<aside className="lg:col-span-1">
					<CustomCreatureRoster
						key={rosterKey}
						onCreatureSelected={handleCreatureSelected}
						onNewCreature={handleNewCreature}
					/>
				</aside>

				{/* Main content - Creature Editor */}
				<main className="lg:col-span-3">
					{activeCreatureId ? (
						<CustomCreatureEditor
							creatureId={activeCreatureId}
							onDelete={handleDeleteCreature}
							onStartFromExisting={() => setShowPicker(true)}
						/>
					) : (
						<div className="bg-parchment border-2 border-stone p-12 text-center">
							<Icon
								path={mdiPlus}
								size={3}
								className="mx-auto text-stone/30 mb-4"
							/>
							<p className="text-stone mb-4">
								Select an existing creature or create a new one to get started.
							</p>
							<FunctionButton
								variant="primary"
								onClick={handleNewCreature}
								className="bg-bronze hover:bg-gold"
							>
								New Creature
							</FunctionButton>
						</div>
					)}
				</main>
			</div>

			{showPicker && (
				<CreaturePicker
					creatures={creatures}
					filters={filters}
					isOpen={showPicker}
					onClose={() => setShowPicker(false)}
					onSelect={(creature) => handleCloneFromCMS(creature)}
				/>
			)}
		</>
	);
};

const CreatureManager = (props: CreatureManagerProps) => {
	return (
		<Suspense>
			<CreatureManagerInner {...props} />
		</Suspense>
	);
};

export default CreatureManager;
