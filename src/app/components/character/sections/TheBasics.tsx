'use client';
import { useState, useReducer, useRef} from 'react';
import { Input, Textarea } from "@nextui-org/input";
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import { CSSTransition, SwitchTransition } from "react-transition-group";
import ExternalLink from '@/app/components/common/ExternalLink';

const reducer = (state: any, action: any) => {
	if (action.type === 'update_name') {
		return {
			name: action.value,
			age: state.age,
			pronouns: state.pronouns,
			description: state.description,
			detailsUpdated: true
		};
	} else if (action.type === 'update_age') {
		return {
			name: state.name,
			age: action.value,
			pronouns: state.pronouns,
			description: state.description,
			detailsUpdated: true
		};
	} else if (action.type === 'update_pronouns') {
		return {
			name: state.name,
			age: state.age,
  			pronouns: action.value,
			description: state.description,
			detailsUpdated: true
		};
	}
	else if (action.type === 'update_description') {
		return {
			name: state.name,
			age: state.age,
			pronouns: state.pronouns,
			description: action.value,
			detailsUpdated: true
		};
	}
	throw Error('Unknown action.');
}

const TheBasics = () => {
	const detailsRef = useRef(null);

	const [state, dispatch] = useReducer(reducer, {
		name: "",
		age: 0,
		pronouns: "",
		description: "",
		detailsUpdated: false
	});

	const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const inputTarget = e.target as HTMLInputElement;
		dispatch({ type: 'update_name', value: inputTarget.value });
	}
	const handleAgeInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const inputTarget = e.target as HTMLInputElement;
		dispatch({ type: 'update_age', value: inputTarget.value });
	}
	const handlePronounsInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const inputTarget = e.target as HTMLInputElement;
		dispatch({ type: 'update_pronouns', value: inputTarget.value });
	}
	const handleDescriptionTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
		const textAreaTarget = e.target as HTMLTextAreaElement;
		dispatch({ type: 'update_description', value: textAreaTarget.value });
	}

	let subtitle = "Enter basic information about your character.";
	state.name !== "" || state.age !== 0 || state.pronouns !== "" ? subtitle = "" : undefined;
	state.age != 0 ? subtitle = `${state.age}` : undefined;
	state.age != 0 && state.pronouns != "" ? subtitle = `${subtitle}, ` : subtitle;
	state.pronouns != "" ? subtitle = subtitle + `${state.pronouns}` : subtitle;

	return (

		<div className="grid grid-cols-2">
			<div className="flex justify-end pt-16 pb-16">
				<div className="max-w-[673px] pr-4">
					<h2 className="marcellus text-3xl w-full border-b-2 border-solid mb-4">Enter Basics</h2>
					<p className="pb-2 w-full">
						Enter some basic information about your character. Note that none of the choices here affect scores. These are purely for roleplaying purposes.
					</p>
					<div className="mb-2 flex justify-between">
						<Input
							isRequired
							value={state.name}
							onChange={handleNameInputChange}
							type="text"
							label="Name"
							variant="bordered"
							radius="sm"
							className="w-72"
							placeholder="Enter Character Name" />
						<Input
							value={state.age}
							onChange={handleAgeInputChange}
							type="number"
							label="Age"
							variant="bordered"
							radius="sm"
							className="w-20"
							placeholder="Enter Age" />
						<Input
							value={state.pronouns}
							onChange={handlePronounsInputChange}
							type="text"
							label="Pronouns"
							variant="bordered"
							radius="sm"
							className="w-56"
							placeholder="Enter Character Pronouns" />
					</div>
					<Textarea
						onChange={handleDescriptionTextareaChange}
						variant="bordered"
						label="Description"
						labelPlacement="inside"
						placeholder="Enter Character Description"
					/>
				</div>
			</div>
			<div className="bg-black text-white pt-16 pb-16">
				<div className="max-w-[768px] pl-4">
					<SwitchTransition mode="out-in">
						<CSSTransition
						   key={state.detailsUpdated ? "x" : "y"}
						   nodeRef={detailsRef}
						   timeout={300}
						   classNames='fade'
						 >
							 <div ref={detailsRef}>
								<SelectDetailExpanded
									imagePath=""
									name={state.name}
									description={subtitle}
									disabled={!state.detailsUpdated}>
									<div className="mt-2">
										{state.description}
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