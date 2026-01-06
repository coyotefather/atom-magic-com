'use client';
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import ExternalLink from '@/app/components/common/ExternalLink';
import { CARDINALS } from '@/lib/global-data';
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setPatronage } from "@/lib/slices/characterSlice";
import {Select, SelectItem} from "@heroui/react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@heroui/react";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useRef } from 'react';
import { CSSTransition, SwitchTransition } from "react-transition-group";
import {
	PATRONAGES_QUERY_RESULT,
} from "../../../../../sanity.types";

const ChoosePatronage = ({
		incompleteFields,
		patronages,
	}: {
		incompleteFields: string,
		patronages: PATRONAGES_QUERY_RESULT
	}) => {
	const detailsRef = useRef(null);
	const dispatch = useAppDispatch();
	const [detailsUpdated, setDetailsUpdated] = useState(false);
	const [details, setDetails] = useState(
		<SelectDetailExpanded
			imagePath=""
			name="Choose a Patron"
			description="Select a patron from the dropdown."
			disabled={true}>
			<div></div>
		</SelectDetailExpanded>
	);

	const handleSelectChange = (event: React.ChangeEvent) => {
		let val = (event.target as HTMLInputElement).value;
		let patronageEffects = (<></>);
		if(val !== "") {
			dispatch(setPatronage(val));
			setDetailsUpdated(curDetailsUpdated => !curDetailsUpdated);
			let cardinal = patronages.find((cardinal) => cardinal._id === val);
			if(cardinal != undefined && cardinal.effects) {
				patronageEffects = (
					<Table
						removeWrapper
						aria-label={`${cardinal.title} Patronage Effects`}
						className="mt-8">
						<TableHeader>
							{["Name","Description"].map((tc) => (
								<TableColumn
									key={tc}
									className="bg-transparent border-b-2 pl-0">
									{tc}
								</TableColumn>
							))}
						</TableHeader>
						<TableBody>
							{(cardinal.effects).map((effect, index) => (
								<TableRow key={`effect-${index}`}>
									<TableCell className="align-top w-1/3 pl-0">
										{effect.entry && effect.entry.slug ? <ExternalLink
										href={`https://atom-magic.com/codex/entries/${effect.entry.slug.current}`} name={effect.title ? effect.title :""} />:effect.title}
									</TableCell>
									<TableCell className="pl-0 prose prose-sm">
										<Markdown remarkPlugins={[remarkGfm]}>
											{effect?.description ?? ""}
										</Markdown>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				);
				setDetails(
					<SelectDetailExpanded
						imagePath={""}
						name={`${cardinal.title}, ${cardinal.epithet}`}
						description={cardinal.description ? cardinal.description : ""}
						disabled={false}>
						{patronageEffects}
					</SelectDetailExpanded>
				);
			}
		}
	};

	return (
		<div className="grid grid-cols-2 divide-x-2 bg-white">
			<div className="flex justify-end pt-16 pb-16">
				<div className="max-w-[673px] pr-4">
					<h2 className="marcellus text-3xl w-full border-b-2 border-solid mb-4">Choose a Patronage</h2>
					<p className="pb-2 w-full">
						Optionally choose a patronage from a Cardinal. This doesn&apos;t directly affect your base or calculated scores but can affect actions you take.
					</p>
					<p className="pb-2 w-full">
						For more information, see <ExternalLink href="https://atom-magic.com/codex/Cardinal_Forces" name="Cardinal Forces" />.
					</p>
					<div className="m-auto w-full">
						<Select
							isRequired
							isInvalid={incompleteFields && incompleteFields !== "init" ? true : false}
							errorMessage="Please select a patronage."
							variant="bordered"
							radius="sm"
							label="Path"
							placeholder="Select a Patron"
							className="w-96 mt-8"
							onChange={(event) => handleSelectChange(event)}>
							{patronages.map((patron) => (
						  		<SelectItem key={patron._id}>
									{patron.title}
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

export default ChoosePatronage;