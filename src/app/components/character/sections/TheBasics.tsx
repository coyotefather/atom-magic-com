'use client';
import { useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setCharacterName, setCharacterAge, setCharacterPronouns, setCharacterDescription } from "@/lib/slices/characterSlice";
import { Input, Textarea } from "@heroui/react";
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

		<div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x-2 bg-white">
			<div className="flex justify-center lg:justify-end py-8 lg:pt-16 lg:pb-16 px-4 lg:px-0">
				<div className="w-full max-w-[673px] lg:pr-4">
					<h2 className="marcellus text-2xl lg:text-3xl w-full border-b-2 border-solid mb-4">Enter Basics</h2>
					<p className="pb-2 w-full">
						Enter some basic information about your character. Note that none of the choices here affect scores. These are purely for roleplaying purposes.
					</p>
					<div className="mb-2 flex flex-col sm:flex-row gap-2 sm:gap-4">
						<Input
							isRequired
							isInvalid={incompleteFields && incompleteFields !== "init" ? true : false}
							errorMessage="Please enter a name."
							onChange={(e) => handleChange(e, 'update_name')}
							type="text"
							label="Name"
							variant="bordered"
							radius="sm"
							className="w-full sm:flex-1"
							placeholder="Enter Character Name" />
						<Input
							onChange={(e) => handleChange(e, 'update_age')}
							type="number"
							label="Age"
							variant="bordered"
							radius="sm"
							className="w-full sm:w-24"
							placeholder="Age" />
						<Input
							onChange={(e) => handleChange(e, 'update_pronouns')}
							type="text"
							label="Pronouns"
							variant="bordered"
							radius="sm"
							className="w-full sm:w-40"
							placeholder="Pronouns" />
					</div>
					<Textarea
						onChange={(e) => handleChange(e, 'update_description')}
						variant="bordered"
						label="Description"
						labelPlacement="inside"
						placeholder="Enter Character Description"
					/>
				</div>
			</div>
			<div className="py-8 lg:pt-16 lg:pb-16 px-4 lg:px-0">
				<div className="w-full max-w-[768px] lg:pl-4">
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