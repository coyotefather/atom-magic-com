'use client';

import { useState, useEffect, useRef } from 'react';
import { mdiPlus, mdiDelete, mdiFileImport, mdiDownload } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';
import CustomCreatureSummaryCard from './CustomCreatureSummaryCard';
import { useAppDispatch } from '@/lib/hooks';
import { loadCreature, clearCreature } from '@/lib/slices/customCreatureSlice';
import {
	getCreatureRoster,
	getCreatureById,
	saveCreatureById,
	deleteCreatureById,
	setActiveCreature,
	createNewCreatureId,
	importCreatureFromFile,
	exportCreatureToFile,
	CustomCreatureSummary,
} from '@/lib/customCreaturePersistence';

interface CustomCreatureRosterProps {
	onCreatureSelected: (id: string) => void;
	onNewCreature: () => void;
}

const CustomCreatureRoster = ({
	onCreatureSelected,
	onNewCreature,
}: CustomCreatureRosterProps) => {
	const dispatch = useAppDispatch();
	const [creatures, setCreatures] = useState<CustomCreatureSummary[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Load roster on mount
	useEffect(() => {
		const roster = getCreatureRoster();
		setCreatures(roster.creatures);
		setActiveId(roster.activeCreatureId);
		setIsLoading(false);
	}, []);

	const handleSelectCreature = (id: string) => {
		const creature = getCreatureById(id);
		if (creature) {
			dispatch(loadCreature(creature));
			setActiveCreature(id);
			setActiveId(id);
			onCreatureSelected(id);
		}
	};

	const handleNewCreature = () => {
		onNewCreature();
	};

	const handleDeleteCreature = (id: string) => {
		deleteCreatureById(id);
		setCreatures((prev) => prev.filter((c) => c.id !== id));
		setDeleteConfirm(null);

		if (activeId === id) {
			setActiveId(null);
			dispatch(clearCreature());
		}
	};

	const handleImportClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			const creature = await importCreatureFromFile(file);
			const id = createNewCreatureId();
			const importedCreature = { ...creature, id, loaded: true };
			saveCreatureById(id, importedCreature);
			dispatch(loadCreature(importedCreature));
			setActiveCreature(id);

			// Refresh roster
			const roster = getCreatureRoster();
			setCreatures(roster.creatures);
			setActiveId(id);
			onCreatureSelected(id);
		} catch (err) {
			console.error('Failed to import creature:', err);
			alert(err instanceof Error ? err.message : 'Failed to import creature');
		}

		// Reset input
		e.target.value = '';
	};

	const handleExportCreature = (id: string, e?: React.MouseEvent) => {
		e?.stopPropagation();
		const creature = getCreatureById(id);
		if (creature) {
			exportCreatureToFile(creature);
		}
	};

	if (isLoading) {
		return (
			<div className="p-8 text-center">
				<p className="text-stone">Loading creatures...</p>
			</div>
		);
	}

	return (
		<div className="bg-parchment border-2 border-stone">
			<div className="p-4 border-b-2 border-stone">
				<h2 className="marcellus text-lg text-black">Custom Creatures</h2>
			</div>

			<div className="p-4 space-y-2">
				{creatures.length === 0 ? (
					<div className="text-center py-8 border-2 border-dashed border-stone/30">
						<p className="text-sm text-stone mb-1">No custom creatures yet</p>
						<p className="text-xs text-stone/60">
							Create a new creature or import an existing one
						</p>
					</div>
				) : (
					creatures.map((creature) => (
						<div key={creature.id} className="relative group">
							<CustomCreatureSummaryCard
								creature={creature}
								isActive={activeId === creature.id}
								onClick={() => handleSelectCreature(creature.id)}
							/>
							{/* Action buttons overlay */}
							<div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
								<FunctionButton
									variant="ghost"
									size="sm"
									onClick={(e) => handleExportCreature(creature.id, e)}
									icon={mdiDownload}
									title="Export creature"
									className="hover:text-gold"
								/>
								{deleteConfirm === creature.id ? (
									<div className="flex items-center gap-1">
										<FunctionButton
											variant="danger"
											size="sm"
											onClick={(e) => {
												e?.stopPropagation();
												handleDeleteCreature(creature.id);
											}}
										>
											Confirm
										</FunctionButton>
										<FunctionButton
											variant="secondary"
											size="sm"
											onClick={(e) => {
												e?.stopPropagation();
												setDeleteConfirm(null);
											}}
											className="border-stone text-stone"
										>
											Cancel
										</FunctionButton>
									</div>
								) : (
									<FunctionButton
										variant="ghost"
										size="sm"
										onClick={(e) => {
											e?.stopPropagation();
											setDeleteConfirm(creature.id);
										}}
										icon={mdiDelete}
										title="Delete creature"
										className="hover:text-oxblood"
									/>
								)}
							</div>
						</div>
					))
				)}
			</div>

			<div className="p-4 border-t-2 border-stone space-y-2">
				<FunctionButton
					variant="primary"
					fullWidth
					onClick={handleNewCreature}
					icon={mdiPlus}
					className="bg-bronze hover:bg-gold"
				>
					New Creature
				</FunctionButton>
				<FunctionButton
					variant="secondary"
					fullWidth
					onClick={handleImportClick}
					icon={mdiFileImport}
					className="border-stone text-stone hover:border-gold hover:text-gold"
				>
					Import
				</FunctionButton>
				<input
					ref={fileInputRef}
					type="file"
					accept=".creatura"
					onChange={handleFileImport}
					className="hidden"
				/>
			</div>
		</div>
	);
};

export default CustomCreatureRoster;
