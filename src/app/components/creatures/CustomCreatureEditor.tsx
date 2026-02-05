'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Icon from '@mdi/react';
import {
	mdiPlus,
	mdiClose,
	mdiDelete,
	mdiDownload,
	mdiContentCopy,
} from '@mdi/js';
import { Checkbox } from '@heroui/react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import {
	selectCustomCreature,
	setCreatureName,
	setCreatureDescription,
	setCreatureScore,
	setCreatureHealth,
	setCreaturePhysicalShield,
	setCreaturePsychicShield,
	setCreatureArmorCapacity,
	setCreatureChallengeLevel,
	setCreatureType,
	setCreatureEnvironments,
	setCreatureIsSwarm,
	setCreatureIsUnique,
	addAttack,
	updateAttack,
	removeAttack,
	addSpecialAbility,
	updateSpecialAbility,
	removeSpecialAbility,
} from '@/lib/slices/customCreatureSlice';
import {
	saveCreatureById,
	exportCreatureToFile,
} from '@/lib/customCreaturePersistence';
import { useCreatureData } from '@/app/components/creatures/CreatureDataContext';
import FunctionButton from '@/app/components/common/FunctionButton';

interface CustomCreatureEditorProps {
	creatureId: string;
	onDelete: () => void;
	onStartFromExisting: () => void;
}

const CHALLENGE_LEVELS = [
	'harmless',
	'trivial',
	'easy',
	'moderate',
	'hard',
	'deadly',
];

const inputStyles =
	'w-full px-4 py-2 border-2 border-stone bg-white focus:border-bronze focus:outline-none';

const labelStyles = 'block text-xs text-stone uppercase tracking-wider mb-2';

const sectionStyles = 'bg-parchment border-2 border-stone p-6';

const sectionTitleStyles =
	'marcellus text-sm uppercase tracking-wider text-stone mb-4';

const CustomCreatureEditor = ({
	creatureId,
	onDelete,
	onStartFromExisting,
}: CustomCreatureEditorProps) => {
	const creature = useAppSelector(selectCustomCreature);
	const dispatch = useAppDispatch();
	const { creatures: cmsCreatures } = useCreatureData();
	const saveTimeoutRef = useRef<NodeJS.Timeout>(undefined);
	const nameInputRef = useRef<HTMLInputElement>(null);

	const [newEnvironment, setNewEnvironment] = useState('');

	// Auto-save with debounce
	useEffect(() => {
		if (!creature.loaded || !creatureId) return;
		if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
		saveTimeoutRef.current = setTimeout(() => {
			saveCreatureById(creatureId, creature);
		}, 500);
		return () => {
			if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
		};
	}, [creature, creatureId]);

	// Auto-focus name input on mount if name is empty
	useEffect(() => {
		if (creature.loaded && !creature.name && nameInputRef.current) {
			nameInputRef.current.focus();
		}
	}, [creature.loaded, creature.name]);

	// Look up the CMS creature for "Based on" reference
	const basedOnCreature = creature.basedOnId
		? cmsCreatures.find((c) => c._id === creature.basedOnId)
		: null;

	const handleAddEnvironment = () => {
		const trimmed = newEnvironment.trim();
		if (trimmed && !creature.environments.includes(trimmed)) {
			dispatch(
				setCreatureEnvironments([...creature.environments, trimmed])
			);
		}
		setNewEnvironment('');
	};

	const handleRemoveEnvironment = (env: string) => {
		dispatch(
			setCreatureEnvironments(
				creature.environments.filter((e) => e !== env)
			)
		);
	};

	const handleEnvironmentKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>
	) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleAddEnvironment();
		}
	};

	if (!creature.loaded) {
		return (
			<div className="p-6 text-stone text-center">
				Loading creature...
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Based on reference */}
			{creature.basedOnId && (
				<div className="text-sm text-stone">
					{basedOnCreature ? (
						<span>
							Based on:{' '}
							<Link
								href={`/codex/entries/${basedOnCreature.slug?.current}`}
								className="text-bronze hover:text-gold underline"
							>
								{basedOnCreature.name}
							</Link>
						</span>
					) : creature.basedOnName ? (
						<span>
							Based on:{' '}
							<span className="italic text-stone">
								{creature.basedOnName}
							</span>
						</span>
					) : null}
				</div>
			)}

			{/* Basic Info */}
			<div className={sectionStyles}>
				<h3 className={sectionTitleStyles}>Basic Info</h3>
				<div className="space-y-4">
					<div>
						<label className={labelStyles}>Name</label>
						<input
							ref={nameInputRef}
							type="text"
							value={creature.name}
							onChange={(e) =>
								dispatch(setCreatureName(e.target.value))
							}
							className={`${inputStyles} marcellus text-xl`}
							placeholder="Creature name"
						/>
					</div>
					<div>
						<label className={labelStyles}>Description</label>
						<textarea
							value={creature.description}
							onChange={(e) =>
								dispatch(
									setCreatureDescription(e.target.value)
								)
							}
							className={inputStyles}
							rows={3}
							placeholder="Short creature description"
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className={labelStyles}>Creature Type</label>
							<input
								type="text"
								value={creature.creatureType}
								onChange={(e) =>
									dispatch(setCreatureType(e.target.value))
								}
								className={inputStyles}
								placeholder="e.g., Beast, Construct"
							/>
						</div>
						<div>
							<label className={labelStyles}>
								Challenge Level
							</label>
							<select
								value={creature.challengeLevel}
								onChange={(e) =>
									dispatch(
										setCreatureChallengeLevel(
											e.target.value
										)
									)
								}
								className={`${inputStyles} marcellus`}
							>
								{CHALLENGE_LEVELS.map((level) => (
									<option key={level} value={level}>
										{level.charAt(0).toUpperCase() +
											level.slice(1)}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>
			</div>

			{/* Scores */}
			<div className={sectionStyles}>
				<h3 className={sectionTitleStyles}>Scores</h3>
				<div className="grid grid-cols-2 gap-4">
					{(
						[
							'physical',
							'interpersonal',
							'intellect',
							'psyche',
						] as const
					).map((field) => (
						<div key={field}>
							<label className={labelStyles}>
								{field.charAt(0).toUpperCase() + field.slice(1)}
							</label>
							<input
								type="number"
								value={creature[field]}
								onChange={(e) =>
									dispatch(
										setCreatureScore({
											field,
											value: Number(e.target.value),
										})
									)
								}
								className={inputStyles}
								min={1}
								max={100}
							/>
						</div>
					))}
				</div>
			</div>

			{/* Combat */}
			<div className={sectionStyles}>
				<h3 className={sectionTitleStyles}>Combat</h3>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className={labelStyles}>Health</label>
						<input
							type="number"
							value={creature.health}
							onChange={(e) =>
								dispatch(
									setCreatureHealth(Number(e.target.value))
								)
							}
							className={inputStyles}
							min={0}
						/>
					</div>
					<div>
						<label className={labelStyles}>Physical Shield</label>
						<input
							type="number"
							value={creature.physicalShield}
							onChange={(e) =>
								dispatch(
									setCreaturePhysicalShield(
										Number(e.target.value)
									)
								)
							}
							className={inputStyles}
							min={0}
						/>
					</div>
					<div>
						<label className={labelStyles}>Psychic Shield</label>
						<input
							type="number"
							value={creature.psychicShield}
							onChange={(e) =>
								dispatch(
									setCreaturePsychicShield(
										Number(e.target.value)
									)
								)
							}
							className={inputStyles}
							min={0}
						/>
					</div>
					<div>
						<label className={labelStyles}>Armor Capacity</label>
						<input
							type="number"
							value={creature.armorCapacity}
							onChange={(e) =>
								dispatch(
									setCreatureArmorCapacity(
										Number(e.target.value)
									)
								)
							}
							className={inputStyles}
							min={0}
						/>
					</div>
				</div>
			</div>

			{/* Attacks */}
			<div className={sectionStyles}>
				<div className="flex items-center justify-between mb-4">
					<h3 className="marcellus text-sm uppercase tracking-wider text-stone">
						Attacks
					</h3>
					<FunctionButton
						variant="ghost"
						size="sm"
						icon={mdiPlus}
						onClick={() => dispatch(addAttack())}
					>
						Add Attack
					</FunctionButton>
				</div>
				<div className="space-y-2">
					{creature.attacks.map((attack) => (
						<div
							key={attack.id}
							className="flex items-center gap-2"
						>
							<input
								type="text"
								value={attack.name}
								onChange={(e) =>
									dispatch(
										updateAttack({
											id: attack.id,
											field: 'name',
											value: e.target.value,
										})
									)
								}
								className={`${inputStyles} flex-1`}
								placeholder="Attack name"
							/>
							<input
								type="text"
								value={attack.damage}
								onChange={(e) =>
									dispatch(
										updateAttack({
											id: attack.id,
											field: 'damage',
											value: e.target.value,
										})
									)
								}
								className={`${inputStyles} w-32`}
								placeholder="Damage"
							/>
							<button
								type="button"
								onClick={() =>
									dispatch(removeAttack(attack.id))
								}
								className="text-stone hover:text-oxblood transition-colors p-1"
								title="Remove attack"
							>
								<Icon path={mdiClose} size={0.75} />
							</button>
						</div>
					))}
					{creature.attacks.length === 0 && (
						<p className="text-sm text-stone italic">
							No attacks added yet.
						</p>
					)}
				</div>
			</div>

			{/* Special Abilities */}
			<div className={sectionStyles}>
				<div className="flex items-center justify-between mb-4">
					<h3 className="marcellus text-sm uppercase tracking-wider text-stone">
						Special Abilities
					</h3>
					<FunctionButton
						variant="ghost"
						size="sm"
						icon={mdiPlus}
						onClick={() => dispatch(addSpecialAbility())}
					>
						Add Ability
					</FunctionButton>
				</div>
				<div className="space-y-2">
					{creature.specialAbilities.map((ability) => (
						<div
							key={ability.id}
							className="flex items-center gap-2"
						>
							<input
								type="text"
								value={ability.name}
								onChange={(e) =>
									dispatch(
										updateSpecialAbility({
											id: ability.id,
											field: 'name',
											value: e.target.value,
										})
									)
								}
								className={`${inputStyles} w-48`}
								placeholder="Ability name"
							/>
							<input
								type="text"
								value={ability.description}
								onChange={(e) =>
									dispatch(
										updateSpecialAbility({
											id: ability.id,
											field: 'description',
											value: e.target.value,
										})
									)
								}
								className={`${inputStyles} flex-1`}
								placeholder="Description"
							/>
							<button
								type="button"
								onClick={() =>
									dispatch(removeSpecialAbility(ability.id))
								}
								className="text-stone hover:text-oxblood transition-colors p-1"
								title="Remove ability"
							>
								<Icon path={mdiClose} size={0.75} />
							</button>
						</div>
					))}
					{creature.specialAbilities.length === 0 && (
						<p className="text-sm text-stone italic">
							No special abilities added yet.
						</p>
					)}
				</div>
			</div>

			{/* Tags */}
			<div className={sectionStyles}>
				<h3 className={sectionTitleStyles}>Tags</h3>
				<div className="space-y-4">
					<div>
						<label className={labelStyles}>Environments</label>
						<div className="flex items-center gap-2">
							<input
								type="text"
								value={newEnvironment}
								onChange={(e) =>
									setNewEnvironment(e.target.value)
								}
								onKeyDown={handleEnvironmentKeyDown}
								className={`${inputStyles} flex-1`}
								placeholder="Environment name"
							/>
							<FunctionButton
								variant="secondary"
								size="sm"
								onClick={handleAddEnvironment}
								isDisabled={!newEnvironment.trim()}
							>
								Add
							</FunctionButton>
						</div>
						{creature.environments.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-3">
								{creature.environments.map((env) => (
									<span
										key={env}
										className="inline-flex items-center gap-1 px-3 py-1 border-2 border-stone/50 bg-white text-sm"
									>
										{env}
										<button
											type="button"
											onClick={() =>
												handleRemoveEnvironment(env)
											}
											className="text-stone hover:text-oxblood transition-colors"
											title={`Remove ${env}`}
										>
											<Icon
												path={mdiClose}
												size={0.5}
											/>
										</button>
									</span>
								))}
							</div>
						)}
					</div>
					<div className="flex items-center gap-6">
						<Checkbox
							isSelected={creature.isSwarm}
							onValueChange={(val) =>
								dispatch(setCreatureIsSwarm(val))
							}
							radius="none"
						>
							<span className="text-sm">Swarm</span>
						</Checkbox>
						<Checkbox
							isSelected={creature.isUnique}
							onValueChange={(val) =>
								dispatch(setCreatureIsUnique(val))
							}
							radius="none"
						>
							<span className="text-sm">Unique</span>
						</Checkbox>
					</div>
				</div>
			</div>

			{/* Actions */}
			<div className="flex flex-wrap gap-2">
				<FunctionButton
					variant="secondary"
					icon={mdiContentCopy}
					onClick={onStartFromExisting}
				>
					Start from Existing
				</FunctionButton>
				<FunctionButton
					variant="secondary"
					icon={mdiDownload}
					onClick={() => exportCreatureToFile(creature)}
				>
					Export
				</FunctionButton>
				<FunctionButton
					variant="danger"
					icon={mdiDelete}
					onClick={onDelete}
				>
					Delete
				</FunctionButton>
			</div>
		</div>
	);
};

export default CustomCreatureEditor;
