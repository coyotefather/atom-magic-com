'use client';
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import ExternalLink from '@/app/components/common/ExternalLink';
import { ANIMAL_COMPANIONS } from '@/lib/global-data';
import { useAppDispatch } from '@/lib/hooks'
import { setAnimalCompanion } from "@/lib/slices/characterSlice";
import {Select, SelectItem} from "@nextui-org/select";
import { Input, Textarea } from "@nextui-org/input";
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
					name={name}
					description={`Type: ${animalType}`}
					disabled={false}>
					<div>
						{description}
					</div>
				</SelectDetailExpanded>
			);
		}
	},[animalId, animalType, name, description] );

	const handleSelectOneChange = (event: React.ChangeEvent) => {
		let val = (event.target as HTMLInputElement).value;
		let children = ANIMAL_COMPANIONS[val as keyof typeof ANIMAL_COMPANIONS].children;
		setSelectedFamily(children);
	};

	const handleSelectTwoChange = (event: React.ChangeEvent) => {
		let val = (event.target as HTMLInputElement).value;
		let companion = selectedFamily.find((c) => c.id === val);
		if(companion) {
			setAnimalId(companion.id);
			setAnimalType(companion.name);
		}
	}

	const handleInput = (event: React.ChangeEvent) => {
		let val = (event.target as HTMLInputElement).value;
		if(val) {
			if(name === "") {
				setDetailsUpdated(curDetailsUpdated => !curDetailsUpdated);
			}
			setName(val);
		}
	};

	const handleTextArea = (event: React.ChangeEvent) => {
		let val = (event.target as HTMLInputElement).value;
		if(val) {
			setDescription(val);
		}
	};

	return (
		<div className="grid grid-cols-2 divide-x-2 bg-white">
			<div className="flex justify-end pt-16 pb-16">
				<div className="max-w-[673px] pr-4">
					<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">Choose an Animal Companion (optional)</h2>
					<p className="pb-2">
						There are many cultures across Solum, though most beings are a member of one of the five main cultures. Choosing a culture will give you two unique aspects.
					</p>
					<p>
						For more information, see <ExternalLink href="https://atom-magic.com/codex/Cultures" name="Cultures" />
					</p>
					<div className="m-auto">
						<div className="grid grid-cols-3 gap-4 mt-8 mb-4">
							<Select
								variant="bordered"
								radius="sm"
								label="Animal Family"
								placeholder="Select a Family"
								onChange={(event) => handleSelectOneChange(event)}>
								<SelectItem key="canidae" value="canidae">Canidae</SelectItem>
								<SelectItem key="felidae" value="felidae">Felidae</SelectItem>
								<SelectItem key="rodentia" value="rodentia">Rodentia</SelectItem>
								<SelectItem key="primates" value="primates">Primates</SelectItem>
								<SelectItem key="aves" value="aves">Aves</SelectItem>
								<SelectItem key="reptilia" value="reptilia">Reptilia</SelectItem>
								<SelectItem key="other" value="other">Other</SelectItem>
							</Select>
							<Select
								isDisabled={selectedFamily.length === 0 ? true : false}
								variant="bordered"
								radius="sm"
								label="Animal"
								placeholder="Select an Animal"
								onChange={(event) => handleSelectTwoChange(event)}>
								{selectedFamily.map( (a) => (
									<SelectItem key={a.id}>{a.name}</SelectItem>
								) )}
							</Select>
							<Input
								isDisabled={animalId ? false : true }
								type="text"
								label="Name"
								variant="bordered"
								radius="sm"
								placeholder="Enter Animal Name"
								onChange={(event) => handleInput(event)} />
						</div>
						<Textarea
							isDisabled={animalId ? false : true }
							variant="bordered"
							label="Details"
							labelPlacement="inside"
							placeholder="Enter Animal Companion Details"
							onChange={(event) => handleTextArea(event)}/>
					</div>
				</div>
			</div>
			<div className="pt-16 pb-16">
				<div className="max-w-[673px] pl-4">
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