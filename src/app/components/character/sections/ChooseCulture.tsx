'use client';
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import ExternalLink from '@/app/components/common/ExternalLink';
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setCulture } from "@/lib/slices/characterSlice";
import { Select, Label, ListBox, FieldError, Table } from "@heroui/react";
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
				<Table>
					<Table.ScrollContainer>
						<Table.Content aria-label={`${chosenCulture.title}`} className="mt-8">
							<Table.Header>
								{["Aspect","Description"].map((tc) => (
									<Table.Column key={tc} id={tc} className="bg-transparent border-b-2 pl-0">
										{tc}
									</Table.Column>
								))}
							</Table.Header>
							<Table.Body>
								{chosenCulture.aspects.map((aspect) => (
									<Table.Row key={String(aspect.aspectId)} id={String(aspect.aspectId)}>
										<Table.Cell className="align-top min-w-44 pl-0">
											<ExternalLink
											href={`https://atom-magic.com/codex/${aspect.aspectContentSlug}`} name={aspect.aspectName ? aspect.aspectName : ""} />
										</Table.Cell>
										<Table.Cell className="pl-0 prose prose-sm">
											<Markdown remarkPlugins={[remarkGfm]}>
												{aspect.aspectDescription}
											</Markdown>
										</Table.Cell>
									</Table.Row>
								))}
							</Table.Body>
						</Table.Content>
					</Table.ScrollContainer>
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

	const handleSelectChange = (val: React.Key | null) => {
		if (val) {
			dispatch(setCulture(String(val)));
			updateDetailsForCulture(String(val));
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
							isInvalid={!!(incompleteFields && incompleteFields !== "init")}
							value={currentCulture ?? ""}
							onChange={handleSelectChange}
							placeholder="Select a Culture"
							className="w-96 mt-8"
						>
							<Label>Culture</Label>
							<Select.Trigger>
								<Select.Value />
								<Select.Indicator />
							</Select.Trigger>
							{!!(incompleteFields && incompleteFields !== "init") && (
								<FieldError>Please select a culture.</FieldError>
							)}
							<Select.Popover>
								<ListBox>
									{cultures.map((culture) => (
										<ListBox.Item key={culture._id} id={culture._id} textValue={culture.title ?? ""}>
											{culture.title}
											<ListBox.ItemIndicator />
										</ListBox.Item>
									))}
								</ListBox>
							</Select.Popover>
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