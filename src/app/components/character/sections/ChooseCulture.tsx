'use client';
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import ExternalLink from '@/app/components/common/ExternalLink';
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setCulture } from "@/lib/slices/characterSlice";
import {Select, SelectItem} from "@heroui/react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useRef, useEffect, useCallback } from 'react';
import { CSSTransition, SwitchTransition } from "react-transition-group";
import {
	CULTURES_QUERY_RESULT,
} from "../../../../../sanity.types";

const ChooseCulture = ({
		cultures,
		incompleteFields
	}: {
		cultures: CULTURES_QUERY_RESULT,
		incompleteFields: string
	}) => {

	const detailsRef = useRef(null);
	const dispatch = useAppDispatch();
	const currentCulture = useAppSelector(state => state.character.culture);

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

	// Update details panel for a given culture ID
	const updateDetailsForCulture = useCallback((cultureId: string) => {
		if (!cultureId) return;

		const chosenCulture = cultures.find((c) => c._id === cultureId);
		if (chosenCulture != undefined && chosenCulture.aspects !== null) {
			const aspects = (
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
								<TableCell className="pl-0 prose prose-sm">
									<Markdown remarkPlugins={[remarkGfm]}>
										{aspect.aspectDescription}
									</Markdown>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			);
			setDetailsUpdated(curDetailsUpdated => !curDetailsUpdated);
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
	}, [cultures]);

	// Update details when currentCulture changes (e.g., when loading a character)
	useEffect(() => {
		if (currentCulture) {
			updateDetailsForCulture(currentCulture);
		}
	}, [currentCulture, updateDetailsForCulture]);

	const handleSelectChange = (event: React.ChangeEvent) => {
		let val = (event.target as HTMLInputElement).value;
		if(val !== "") {
			dispatch(setCulture(val));
			updateDetailsForCulture(val);
		}
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 md:divide-x-2 bg-white">
			<div className="flex justify-center md:justify-end py-8 md:py-16 px-4 md:px-0">
				<div className="max-w-[673px] md:pr-4">
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
							radius="none"
							label="Culture"
							placeholder="Select a Culture"
							className="w-96 mt-8"
							selectedKeys={currentCulture ? [currentCulture] : []}
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

export default ChooseCulture;