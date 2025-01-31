'use client';
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import ExternalLink from '@/app/components/common/ExternalLink';
import { useAppDispatch } from '@/lib/hooks'
import { setCulture } from "@/lib/slices/characterSlice";
import {Select, SelectItem} from "@heroui/select";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { useState, useRef } from 'react';
import { CSSTransition, SwitchTransition } from "react-transition-group";
import {
	CULTURES_QUERYResult,
} from "../../../../../sanity.types";

const ChooseCulture = ({
		cultures,
		incompleteFields
	}: {
		cultures: CULTURES_QUERYResult,
		incompleteFields: string
	}) => {

	// const cultures = await sanityFetch<CULTURES_QUERYResult>({
	// 	query: CULTURES_QUERY,
	// });
	// if (!cultures) {
	// 	return notFound();
	// }

	const detailsRef = useRef(null);
	const dispatch = useAppDispatch();

	const [details, setDetails] = useState(
		<SelectDetailExpanded
			imagePath=""
			name="Choose a Culture"
			description="Select a culture from the dropdown."
			disabled={true}>
			<div></div>
		</SelectDetailExpanded>
	);
	const [detailsUpdated, setDetailsUpdated] = useState(false);

	const handleSelectChange = (event: React.ChangeEvent) => {
		let val = (event.target as HTMLInputElement).value;
		let aspects = (<></>);
		if(val !== "") {
			dispatch(setCulture(val));
			setDetailsUpdated(curDetailsUpdated => !curDetailsUpdated);
			let chosenCulture = cultures.find((c) => c._id === val);
			if(chosenCulture != undefined && chosenCulture.aspects !== null) {
				aspects = (
					<Table
						isCompact
						removeWrapper
						aria-label={`${chosenCulture.title}`}
						className="mt-8">
						<TableHeader>
							{["Aspect","Description"].map((tc) => (
								<TableColumn
									key={tc}
									className="bg-transparent border-b-2 pl-0">
									{tc}
								</TableColumn>
							))}
						</TableHeader>
						<TableBody>
							{chosenCulture.aspects.map((aspect) => (
								<TableRow key={aspect.aspectId}>
									<TableCell className="align-top min-w-44 pl-0">
										<ExternalLink
										href={`https://atom-magic.com/codex/${aspect.aspectContentSlug}`} name={aspect.aspectName ? aspect.aspectName : ""} />
									</TableCell>
									<TableCell className="pl-0">
										{aspect.aspectDescription}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				);
				setDetails(
					<SelectDetailExpanded
						imagePath="/atom-magic-circle-black.png"
						name={chosenCulture.title ? chosenCulture.title : ""}
						description={chosenCulture.description ? chosenCulture.description : ""}
						disabled={false}>
						{aspects}
					</SelectDetailExpanded>
				);
			}
		}
	};

	return (
		<div className="grid grid-cols-2 divide-x-2 bg-white">
			<div className="flex justify-end pt-16 pb-16">
				<div className="max-w-[673px] pr-4">
					<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">Choose a Culture</h2>
					<p className="pb-2">
						There are many cultures across Solum, though most beings are a member of one of the five main cultures. Choosing a culture will give you two unique aspects.
					</p>
					<p>
						For more information, see <ExternalLink href="https://atom-magic.com/codex/Cultures" name="Cultures" />
					</p>
					<div className="m-auto">
						<Select
							isRequired
							isInvalid={incompleteFields && incompleteFields !== "init" ? true : false}
							errorMessage="Please select a culture."
							variant="bordered"
							radius="sm"
							label="Culture"
							placeholder="Select a Culture"
							className="w-96 mt-8"
							onChange={(event) => handleSelectChange(event)}
					  	>
							{cultures.map((culture) => (
						  	<SelectItem key={culture._id }>
								{culture.title}
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

export default ChooseCulture;