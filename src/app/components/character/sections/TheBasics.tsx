'use client';
import { useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setCharacterName, setCharacterAge, setCharacterPronouns, setCharacterDescription } from "@/lib/slices/characterSlice";
import { TextField, Label, Input, FieldError } from "@heroui/react";
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
	const [detailsUpdated, setDetailsUpdated] = useState(false);
	const dispatch = useAppDispatch()

	const handleChange  = (
		event: React.ChangeEvent<HTMLInputElement>,
		updateType: string): void => {

		const inputTarget = event.target as HTMLInputElement;
		switch(updateType) {
			case "update_name":
				dispatch(setCharacterName(inputTarget.value));
				setDetailsUpdated(true);
				break;
			case "update_age":
				dispatch(setCharacterAge(Number(inputTarget.value)));
				setDetailsUpdated(true);
				break;
			case "update_pronouns":
				dispatch(setCharacterPronouns(inputTarget.value));
				setDetailsUpdated(true);
				break;
			case "update_description":
				dispatch(setCharacterDescription(inputTarget.value));
				setDetailsUpdated(true);
				break;
			default:
				break;
		}
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
							isInvalid={!!(incompleteFields && incompleteFields !== "init")}
							className="w-full sm:flex-1"
						>
							<Label>Name</Label>
							<Input
								type="text"
								placeholder="Enter Character Name"
								onChange={(e) => handleChange(e, 'update_name')}
							/>
							{!!(incompleteFields && incompleteFields !== "init") && (
								<FieldError>Please enter a name.</FieldError>
							)}
						</TextField>
						<TextField className="w-full sm:w-24">
							<Label>Age</Label>
							<Input
								type="number"
								placeholder="Age"
								onChange={(e) => handleChange(e, 'update_age')}
							/>
						</TextField>
						<TextField className="w-full sm:w-40">
							<Label>Pronouns</Label>
							<Input
								type="text"
								placeholder="Pronouns"
								onChange={(e) => handleChange(e, 'update_pronouns')}
							/>
						</TextField>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-sm text-stone">Description</label>
						<textarea
							onChange={(e) => {
								dispatch(setCharacterDescription(e.target.value));
								setDetailsUpdated(true);
							}}
							className="border-2 border-stone p-2 w-full min-h-[100px] bg-white"
							placeholder="Enter Character Description"
						/>
					</div>
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