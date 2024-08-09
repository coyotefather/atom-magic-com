'use client';
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import ExternalLink from '@/app/components/common/ExternalLink';
import { CULTURES } from '@/app/lib/global-data';
import {Select, SelectSection, SelectItem} from "@nextui-org/select";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue} from "@nextui-org/react";
import { useState, useRef } from 'react';
import clsx from 'clsx';
import { CSSTransition, SwitchTransition } from "react-transition-group";

const ChooseCulture = () => {
	const detailsRef = useRef(null);

	const [details, setDetails] = useState(
		<SelectDetailExpanded
			imagePath=""
			name="Choose a Culture"
			description="Select a path from the dropdown."
			disabled={true}>
			<div></div>
		</SelectDetailExpanded>
	);
	const [detailsUpdated, setDetailsUpdated] = useState(false);

	const handleSelectChange = (event: React.ChangeEvent) => {
		let val = (event.target as HTMLInputElement).value;
		let aspects = (<></>);
		if(val !== "") {
			setDetailsUpdated(curDetailsUpdated => !curDetailsUpdated);
			let culture = CULTURES.find((culture) => culture.value === val);
			if(culture != undefined) {
				aspects = (
					<div className="dark">
						<Table removeWrapper aria-label={`${culture.name}`}>
							<TableHeader>
								{["Aspect","Description"].map((tc) => (
									<TableColumn
										key={tc}
										className="marcellus text-white text-md bg-transparent border-b-2 border-white">
										{tc}
									</TableColumn>
								))}
							</TableHeader>
							<TableBody>
								{culture.aspects.map((aspect) => (
									<TableRow key={aspect.value}>
										<TableCell className="align-top min-w-44">
											<ExternalLink
											href={`https://atom-magic.com/codex/${aspect.page}`} name={aspect.name} />
										</TableCell>
										<TableCell>
											{aspect.description}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				);
				setDetails(
					<SelectDetailExpanded
						imagePath="/atom-magic-circle-black.png"
						name={culture.name}
						description={culture.description}
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
							variant="bordered"
							radius="sm"
							label="Culture"
							placeholder="Select a Culture"
							className="w-96 mt-8"
							onChange={(event) => handleSelectChange(event)}
					  	>
							{CULTURES.map((culture) => (
						  	<SelectItem key={culture.value}>
								{culture.name}
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