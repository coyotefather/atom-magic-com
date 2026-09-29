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
 *      Rodentia, Primates, Aves, Reptilia, Other) from `ANIMAL_COMPANIONS`.
 *   2. "Animal" dropdown — narrows to specific animals within that family.
 *   3. "Name" text field — enabled once an animal is chosen.
 *   4. "Details" text area — free-form text for backstory, personality, etc.
 *
 * Redux is the single source of truth: every field reads from and dispatches
 * `setAnimalCompanion()` directly, so a loaded or shared character shows its saved
 * companion. The family and animal type are derived from the stored animal `id`;
 * the only local state is a family the player has picked before choosing an animal.
 *
 * The right panel shows an animated `SelectDetailExpanded` preview once the companion
 * has both an animal and a name (the filled/empty state is the CSSTransition key).
 *
 * This section is marked optional in the wizard — the Section's `incomplete` prop is
 * always an empty string, meaning it will never block advancing to WrapUp.
 *
 * Used by:
 *   - Sections.tsx (ninth wizard section, after ManageWealth)
 */
'use client';
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import { ANIMAL_COMPANIONS } from '@/lib/global-data';
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setAnimalCompanion } from "@/lib/slices/characterSlice";
import { Select, Label, ListBox, TextField, Input, TextArea } from "@heroui/react";
import { useState, useRef } from 'react';
import { CSSTransition, SwitchTransition } from "react-transition-group";

type FamilyId = keyof typeof ANIMAL_COMPANIONS;

const FAMILIES = Object.values(ANIMAL_COMPANIONS);

/** Finds the family containing a given animal id, if any. */
const findFamily = (animalId: string) =>
	FAMILIES.find((f) => f.children.some((c) => c.id === animalId));

const ChooseAnimalCompanion = () => {
	const detailsRef = useRef(null);
	const dispatch = useAppDispatch();
	const companion = useAppSelector(state => state.character.animalCompanion);

	// A saved animal determines its family; otherwise use the family the player picked
	const [pickedFamily, setPickedFamily] = useState<FamilyId | null>(null);
	const savedFamily = companion.id ? findFamily(companion.id) : undefined;
	const familyId = (savedFamily?.id as FamilyId | undefined) ?? pickedFamily;
	const animals = familyId ? ANIMAL_COMPANIONS[familyId].children : [];
	const animal = savedFamily?.children.find((c) => c.id === companion.id);
	const isComplete = !!(animal && companion.name);

	const update = (changes: Partial<typeof companion>) =>
		dispatch(setAnimalCompanion({ ...companion, ...changes }));

	const handleFamilyChange = (val: React.Key | null) => {
		if (!val || val === familyId) return;
		setPickedFamily(val as FamilyId);
		// The previously chosen animal belongs to another family, so clear it
		if (companion.id) update({ id: "" });
	};

	const handleAnimalChange = (val: React.Key | null) => {
		if (val) update({ id: String(val) });
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 md:divide-x-2 bg-white">
			<div className="flex justify-center md:justify-end py-8 md:py-16 px-4 md:px-0">
				<div className="max-w-[673px] md:pr-4">
					<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">Choose an Animal Companion (optional)</h2>
					<p className="pb-2">
						An animal companion is optional and purely for roleplaying; it does not affect scores. Choose a family, then an animal, and give your companion a name and any details.
					</p>
					<div className="m-auto">
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 mb-4">
							<Select value={familyId} onChange={handleFamilyChange} placeholder="Select a Family">
								<Label>Animal Family</Label>
								<Select.Trigger>
									<Select.Value />
									<Select.Indicator />
								</Select.Trigger>
								<Select.Popover>
									<ListBox>
										{FAMILIES.map((f) => (
											<ListBox.Item key={f.id} id={f.id} textValue={f.name}>
												{f.name}
												<ListBox.ItemIndicator />
											</ListBox.Item>
										))}
									</ListBox>
								</Select.Popover>
							</Select>
							<Select
								isDisabled={animals.length === 0}
								value={companion.id || null}
								onChange={handleAnimalChange}
								placeholder="Select an Animal"
							>
								<Label>Animal</Label>
								<Select.Trigger>
									<Select.Value />
									<Select.Indicator />
								</Select.Trigger>
								<Select.Popover>
									<ListBox>
										{animals.map((a) => (
											<ListBox.Item key={a.id} id={a.id} textValue={a.name}>
												{a.name}
												<ListBox.ItemIndicator />
											</ListBox.Item>
										))}
									</ListBox>
								</Select.Popover>
							</Select>
							<TextField
								isDisabled={!companion.id}
								value={companion.name}
								onChange={(name) => update({ name })}
							>
								<Label>Name</Label>
								<Input type="text" placeholder="Enter Animal Name" />
							</TextField>
						</div>
						<TextField
							isDisabled={!companion.id}
							value={companion.details}
							onChange={(details) => update({ details })}
							className="flex flex-col gap-1"
						>
							<Label>Details</Label>
							<TextArea
								placeholder="Enter Animal Companion Details"
								className="border-2 border-stone p-2 w-full min-h-[100px] bg-white"
							/>
						</TextField>
					</div>
				</div>
			</div>
			<div className="py-8 md:py-16 px-4 md:px-0">
				<div className="max-w-[673px] md:pl-4">
					<SwitchTransition mode="out-in">
						<CSSTransition
							key={isComplete ? "x" : "y"}
							nodeRef={detailsRef}
							timeout={300}
							classNames='fade-grow'
						>
							<div ref={detailsRef}>
								{isComplete ? (
									<SelectDetailExpanded
										imagePath=""
										name={companion.name}
										description={`Type: ${animal?.name}`}
										disabled={false}>
										<div>
											{companion.details}
										</div>
									</SelectDetailExpanded>
								) : (
									<SelectDetailExpanded
										imagePath=""
										name="Choose an Animal Companion"
										description="Select an animal from the dropdowns."
										disabled={true}>
										<div></div>
									</SelectDetailExpanded>
								)}
							</div>
						</CSSTransition>
					</SwitchTransition>
				</div>
			</div>
		</div>
	);
};

export default ChooseAnimalCompanion;
