'use client';
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import ExternalLink from '@/app/components/common/ExternalLink';
import { PATHS } from '@/lib/global-data';
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setPath } from "@/lib/slices/characterSlice";
import {Select, SelectItem} from "@nextui-org/select";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@nextui-org/react";
import { useState, useRef } from 'react';
import clsx from 'clsx';
import { CSSTransition, SwitchTransition } from "react-transition-group";
import {
	PATHS_QUERYResult,
} from "../../../../../sanity.types";

const ChoosePath = ({
		paths,
		incompleteFields
	}: {
		paths: PATHS_QUERYResult,
		incompleteFields: string
	}) => {
	const detailsRef = useRef(null);
	const dispatch = useAppDispatch();

	const [details, setDetails] = useState(
		<SelectDetailExpanded
			imagePath=""
			name="Choose a Path"
			description="Select a path from the dropdown."
			disabled={true}>
			<div></div>
		</SelectDetailExpanded>
	);
	const [detailsUpdated, setDetailsUpdated] = useState(false);

	const handleSelectChange = (event: React.ChangeEvent) => {
		let val = (event.target as HTMLInputElement).value;
		let modifiers = (<></>);
		//let nameWithUnderscores = "";
		if(val !== "") {
			dispatch(setPath(val));
			setDetailsUpdated(curDetailsUpdated => !curDetailsUpdated);
			let chosenPath = paths.find((p) => p._id === val);
			// let allModifiers: {
			// 	parentName: string,
			// 	page: string,
			// 	id: string,
			// 	name: string,
			// 	parentId: string,
			// 	value: number
			// }[] = [];
			if(chosenPath && chosenPath.modifiers !== null) {
				// chosenPath.modifiers.map((subscore) => {
				// 	subscore.modifier.map((m) => {
				// 		if(m.value != 0) {
				// 			nameWithUnderscores = m.name.replace(/ /g,"_");
				// 			allModifiers.push({
				// 				parentName: subscore.name,
				// 				page: `${subscore.name}#${nameWithUnderscores}`,
				// 				...m
				// 			});
				// 		}
				// 	});
				// });

				modifiers = (
					<Table isCompact removeWrapper aria-label={`${chosenPath.title} Modifiers`} className="mt-8">
						<TableHeader>
							{["Score", "Subscore","Modifier"].map((tc) => (
								<TableColumn
									key={tc}
									className="bg-transparent border-b-2 pl-0">
									{tc}
								</TableColumn>
							))}
						</TableHeader>
						<TableBody>
							{chosenPath.modifiers.map((m, index) => (
								<TableRow key={`path-modifier-${index}`} >
									<TableCell className="text-base pl-0">
										{m.modifierSubscore && m.modifierSubscore.score ? m.modifierSubscore.score.title : ""}
									</TableCell>
									<TableCell className="text-base pl-0">
										{m.modifierSubscore && m.modifierSubscore.title ? m.modifierSubscore.title : ""}
									</TableCell>
									<TableCell className={clsx(
										'pl-0 font-bold',
										{
											'text-adobe': m.modifierValue && m.modifierValue < 0
										},
										{
											'text-dark-olive-green': m.modifierValue && m.modifierValue > 0
										},
									)}>
										{m.modifierValue && m.modifierValue > 0 ? "+" : ""}
										{m.modifierValue ? m.modifierValue : ""}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				);
				setDetails(
					<SelectDetailExpanded
						imagePath="/atom-magic-circle-black.png"
						name={chosenPath.title ? chosenPath.title : ""}
						description={chosenPath.description ? chosenPath.description : ""}
						disabled={false}>
						{modifiers}
					</SelectDetailExpanded>
				);
			}
		}
	};

	return (
		<div className="grid grid-cols-2 divide-x-2 bg-white">
			<div className="flex justify-end pt-16 pb-16">
				<div className="max-w-[673px] pr-4">
					<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">Choose a Path</h2>
					<p className="pb-2">
						Paths indicate how your character came to be skilled in the arts of atom magic. While many techniques are common to all three, some are specific to each path.
					</p>
					<p>
						For more information, see <ExternalLink href="https://atom-magic.com/codex/Paths" name="Character paths" />.
					</p>
					<div className="m-auto">
						<Select
							isRequired
							isInvalid={incompleteFields && incompleteFields !== "init" ? true : false}
							errorMessage="Please select a path."
							variant="bordered"
							radius="sm"
							label="Path"
							placeholder="Select a Path"
							className="w-96 mt-8"
							onChange={(event) => handleSelectChange(event)}
					  	>
							{paths.map((path) => (
							  <SelectItem key={path._id}>
								{path.title}
							  </SelectItem>
							))}
						</Select>
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

export default ChoosePath;