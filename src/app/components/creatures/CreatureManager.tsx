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
import {
	CREATURES_QUERY_RESULT,
	CREATURE_FILTERS_QUERY_RESULT,
} from '../../../../sanity.types';

interface CreatureManagerProps {
	creatures: CREATURES_QUERY_RESULT;
	filters: CREATURE_FILTERS_QUERY_RESULT;
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

	const handleCloneFromCMS = (cmsCreature: CREATURES_QUERY_RESULT[number]) => {
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
