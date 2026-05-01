/**
 * ChooseAnimalCompanion.tsx
 *
 * An optional wizard section that lets the player assign a named animal companion to
 * their character. Animal companions are purely roleplaying additions — they do not
 * affect scores or combat stats, but are stored in the character's Redux state
 * (`animalCompanion: { id, name, details }`) and exported with the character.
 *
 * Selection is a two-step cascade:
 *   1. "Animal Family" dropdown — picks a broad taxonomic group (Canidae, Felidae,
 *      Rodentia, Primates, Aves, Reptilia, Other) from a hard-coded list.
 *   2. "Animal" dropdown — narrows to specific animals within that family, populated
 *      from the `ANIMAL_COMPANIONS` constant in `global-data.ts`.
 *   3. "Name" text field — becomes enabled once an animal type is chosen, letting the
 *      player give their companion a personal name.
 *   4. "Details" textarea — free-form text for backstory, personality, etc.
 *
 * The right panel shows an animated `SelectDetailExpanded` preview that updates
 * whenever the animal ID or name changes (the `detailsUpdated` boolean toggle is used
 * as the CSSTransition key to trigger the fade-grow animation).
 *
 * All four fields dispatch `setAnimalCompanion()` to Redux via a single `useEffect`
 * that watches `animalId`, `animalType`, `name`, and `description`.
 *
 * This section is marked optional in the wizard — the Section's `incomplete` prop is
 * always an empty string, meaning it will never block advancing to WrapUp.
 *
 * Props:
 *   - incompleteFields: validation error string (always empty; section is optional)
 *
 * Used by:
 *   - Sections.tsx (ninth wizard section, after ManageWealth)
 */
'use client';
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import ExternalLink from '@/app/components/common/ExternalLink';
import { ANIMAL_COMPANIONS } from '@/lib/global-data';
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setAnimalCompanion } from "@/lib/slices/characterSlice";
import { Select, Label, ListBox, TextField, Input } from "@heroui/react";
import { useState, useRef, useEffect } from 'react';
import { CSSTransition, SwitchTransition } from "react-transition-group";

interface AnimalCompanion {
	id: string,
	name: string,
	description: string
};

const ChooseAnimalCompanion = ({
		incompleteFields
	}: {
		incompleteFields: string
	}) => {
	const detailsRef = useRef(null);
	const dispatch = useAppDispatch();
	const [detailsUpdated, setDetailsUpdated] = useState(false);
	const [selectedFamily, setSelectedFamily] = useState<AnimalCompanion[]>([]);
	const [animalId, setAnimalId] = useState("");
	const [animalType, setAnimalType] = useState("");
	const [name, setName] = useState("");
	const animalCompanion = useAppSelector(state => state.character.animalCompanion);
	const [description, setDescription] = useState("");
	const [details, setDetails] = useState(
		<SelectDetailExpanded
			imagePath=""
			name="Choose an Animal Companion"
			description="Select a path from the dropdown."
			disabled={true}>
			<div></div>
		</SelectDetailExpanded>
	);

	useEffect( () => {
		dispatch(setAnimalCompanion(
			{
				id: animalId,
				name: name,
				details: description
			}
		));
		if( animalId && name ) {
			setDetails(
				<SelectDetailExpanded
					imagePath=""
					name={animalCompanion.name}
					description={`Type: ${animalType}`}
					disabled={false}>
					<div>
						{animalCompanion.details}
					</div>
				</SelectDetailExpanded>
			);
		}
	},[animalId, animalType, name, description, dispatch, animalCompanion] );

	const handleSelectOneChange = (val: React.Key | null) => {
		if (val) {
			let children = ANIMAL_COMPANIONS[String(val) as keyof typeof ANIMAL_COMPANIONS].children;
			setSelectedFamily(children);
		}
	};

	const handleSelectTwoChange = (val: React.Key | null) => {
		if (val) {
			let companion = selectedFamily.find((c) => c.id === String(val));
			if(companion) {
				setAnimalId(companion.id);
				setAnimalType(companion.name);
			}
		}
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 md:divide-x-2 bg-white">
			<div className="flex justify-center md:justify-end py-8 md:py-16 px-4 md:px-0">
				<div className="max-w-[673px] md:pr-4">
					<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">Choose an Animal Companion (optional)</h2>
					<p className="pb-2">
						There are many cultures across Solum, though most beings are a member of one of the five main cultures. Choosing a culture will give you two unique aspects.
					</p>
					<p>
						For more information, see <ExternalLink href="https://atom-magic.com/codex/Cultures" name="Cultures" />
					</p>
					<div className="m-auto">
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 mb-4">
							<Select onChange={handleSelectOneChange} placeholder="Select a Family">
								<Label>Animal Family</Label>
								<Select.Trigger>
									<Select.Value />
									<Select.Indicator />
								</Select.Trigger>
								<Select.Popover>
									<ListBox>
										{[
											{ id: "canidae", label: "Canidae" },
											{ id: "felidae", label: "Felidae" },
											{ id: "rodentia", label: "Rodentia" },
											{ id: "primates", label: "Primates" },
											{ id: "aves", label: "Aves" },
											{ id: "reptilia", label: "Reptilia" },
											{ id: "other", label: "Other" },
										].map((item) => (
											<ListBox.Item key={item.id} id={item.id} textValue={item.label}>
												{item.label}
												<ListBox.ItemIndicator />
											</ListBox.Item>
										))}
									</ListBox>
								</Select.Popover>
							</Select>
							<Select
								isDisabled={selectedFamily.length === 0}
								onChange={handleSelectTwoChange}
								placeholder="Select an Animal"
							>
								<Label>Animal</Label>
								<Select.Trigger>
									<Select.Value />
									<Select.Indicator />
								</Select.Trigger>
								<Select.Popover>
									<ListBox>
										{selectedFamily.map((a) => (
											<ListBox.Item key={a.id} id={a.id} textValue={a.name}>
												{a.name}
												<ListBox.ItemIndicator />
											</ListBox.Item>
										))}
									</ListBox>
								</Select.Popover>
							</Select>
							<TextField isDisabled={!animalId}>
								<Label>Name</Label>
								<Input
									type="text"
									placeholder="Enter Animal Name"
									onChange={(e) => {
										const val = e.target.value;
										if (val) {
											if (name === "") setDetailsUpdated(cur => !cur);
											setName(val);
										}
									}}
								/>
							</TextField>
						</div>
						<div className="flex flex-col gap-1">
							<label className={`text-sm ${!animalId ? 'opacity-50' : ''}`}>Details</label>
							<textarea
								disabled={!animalId}
								placeholder="Enter Animal Companion Details"
								className="border-2 border-stone p-2 w-full min-h-[100px] bg-white disabled:opacity-50"
								onChange={(e) => {
									if (e.target.value) setDescription(e.target.value);
								}}
							/>
						</div>
					</div>
				</div>
			</div>
			<div className="py-8 md:py-16 px-4 md:px-0">
				<div className="max-w-[673px] md:pl-4">
					<SwitchTransition mode="out-in">
						<CSSTransition
				   		key={detailsUpdated ? "x" : "y"}
				   		nodeRef={detailsRef}
				   		timeout={300}
				   		classNames='fade-grow'
				 		>
				 			<div ref={detailsRef}>
					 			{details}
				 			</div>
						</CSSTransition>
					</SwitchTransition>
				</div>
			</div>
		</div>
	);
};

export default ChooseAnimalCompanion;