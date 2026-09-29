/**
 * TheBasics.tsx
 *
 * The first real wizard section (after CharacterOptions) where the player enters
 * fundamental personal details about their character. None of these fields affect
 * game-mechanical scores — they are purely for roleplaying and identification purposes.
 *
 * Fields:
 *   - Name (required): dispatches `setCharacterName()` to Redux. Shows a validation
 *     error ("Please enter a name.") if the user tries to advance with an empty name.
 *   - Age (optional): numeric field, dispatches `setCharacterAge()`.
 *   - Pronouns (optional): free text, dispatches `setCharacterPronouns()`.
 *   - Description (optional): multi-line textarea, dispatches `setCharacterDescription()`.
 *
 * Layout is the standard split two-column panel:
 *   Left: The input form (name + age + pronouns on one row, description below).
 *   Right: An animated `SelectDetailExpanded` preview that shows the entered name,
 *          a subtitle line of "age, pronouns" (or just one if the other is missing),
 *          and the description text. The preview panel remains in its disabled/empty
 *          state until `detailsUpdated` becomes true (i.e., the user has typed
 *          something), at which point it animates in via the fade-grow transition.
 *
 * All dispatch calls happen inline in the input event handlers (not via useEffect),
 * so Redux state is updated keystroke-by-keystroke — the character is auto-saved
 * as the user types.
 *
 * Props:
 *   - incompleteFields: validation error string from `useCharacterValidation`; set to
 *     "init" on first render (suppresses the error display) and to a non-empty
 *     message after the user clicks to advance with an empty name field.
 *
 * Used by:
 *   - Sections.tsx (first content section, always expanded at the top of the wizard)
 */
'use client';
import { useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setCharacterName, setCharacterAge, setCharacterPronouns, setCharacterDescription } from "@/lib/slices/characterSlice";
import { TextField, Label, Input, TextArea, FieldError } from "@heroui/react";
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import { CSSTransition, SwitchTransition } from "react-transition-group";
import ExternalLink from '@/app/components/common/ExternalLink';


const TheBasics = ({
		incompleteFields
	}: {
		incompleteFields: string
	}) => {
	const detailsRef = useRef(null);
	const name = useAppSelector(state => state.character.name);
	const age = useAppSelector(state => state.character.age);
	const pronouns = useAppSelector(state => state.character.pronouns);
	const description = useAppSelector(state => state.character.description);
	// Start "updated" if a loaded character already has basics, so the preview shows them
	const [detailsUpdated, setDetailsUpdated] = useState(() => !!(name || age || pronouns || description));
	const dispatch = useAppDispatch()
	const isNameInvalid = !!(incompleteFields && incompleteFields !== "init");

	const handleChange = (value: string, updateType: string): void => {
		switch(updateType) {
			case "update_name":
				dispatch(setCharacterName(value));
				break;
			case "update_age":
				dispatch(setCharacterAge(Number(value)));
				break;
			case "update_pronouns":
				dispatch(setCharacterPronouns(value));
				break;
			case "update_description":
				dispatch(setCharacterDescription(value));
				break;
			default:
				return;
		}
		setDetailsUpdated(true);
	}

	let subtitle = "";
	if(age != 0 && pronouns === "") {
		subtitle = `${age}`;
	} else if(pronouns != "" && age === 0) {
		subtitle = `${pronouns}`;
	} else if(age != 0 && pronouns != "") {
		subtitle = `${age}, ${pronouns}`;
	} else {
		subtitle = "Enter basic information about your character.";
	}

	return (

		<div className="grid grid-cols-1 md:grid-cols-2 md:divide-x-2 bg-white">
			<div className="flex justify-center md:justify-end py-8 md:py-16 px-4 md:px-0">
				<div className="w-full max-w-[673px] md:pr-4">
					<h2 className="marcellus text-2xl md:text-3xl w-full border-b-2 border-solid mb-4">Enter Basics</h2>
					<p className="pb-2 w-full">
						Enter some basic information about your character. Note that none of the choices here affect scores. These are purely for roleplaying purposes.
					</p>
					<div className="mb-2 flex flex-col sm:flex-row gap-2 sm:gap-4">
						<TextField
							isRequired
							isInvalid={isNameInvalid}
							value={name}
							onChange={(v) => handleChange(v, 'update_name')}
							className="w-full sm:flex-1"
						>
							<Label>Name</Label>
							<Input type="text" placeholder="Enter Character Name" />
							<FieldError>Please enter a name.</FieldError>
						</TextField>
						<TextField
							type="number"
							value={age ? String(age) : ""}
							onChange={(v) => handleChange(v, 'update_age')}
							className="w-full sm:w-24"
						>
							<Label>Age</Label>
							<Input placeholder="Age" />
						</TextField>
						<TextField
							value={pronouns}
							onChange={(v) => handleChange(v, 'update_pronouns')}
							className="w-full sm:w-40"
						>
							<Label>Pronouns</Label>
							<Input type="text" placeholder="Pronouns" />
						</TextField>
					</div>
					<TextField
						value={description}
						onChange={(v) => handleChange(v, 'update_description')}
						className="flex flex-col gap-1"
					>
						<Label>Description</Label>
						<TextArea
							className="border-2 border-stone p-2 w-full min-h-[100px] bg-white"
							placeholder="Enter Character Description"
						/>
					</TextField>
				</div>
			</div>
			<div className="py-8 md:py-16 px-4 md:px-0">
				<div className="w-full max-w-[768px] md:pl-4">
					<SwitchTransition mode="out-in">
						<CSSTransition
						   key={detailsUpdated ? "x" : "y"}
						   nodeRef={detailsRef}
						   timeout={300}
						   classNames='fade-grow'
						 >
							 <div ref={detailsRef}>
								<SelectDetailExpanded
									imagePath=""
									name={name}
									description={subtitle}
									disabled={!detailsUpdated}>
									<div className="mt-2">
										{description}
									</div>
								</SelectDetailExpanded>
							 </div>
						</CSSTransition>
					</SwitchTransition>
				</div>
			</div>
		</div>
	);
};

export default TheBasics;