'use client';
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import ExternalLink from '@/app/components/common/ExternalLink';
import { CARDINALS } from '@/lib/global-data';
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setPatronage } from "@/lib/slices/characterSlice";
import {Select, SelectItem} from "@nextui-org/select";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@nextui-org/react";
import { useState, useRef } from 'react';
import { CSSTransition, SwitchTransition } from "react-transition-group";


const ChoosePatronage = ({
		incompleteFields
	}: {
		incompleteFields: string
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
			let cardinal = CARDINALS.find((cardinal) => cardinal.value === val);
			if(cardinal != undefined) {
				patronageEffects = (
					<Table
						removeWrapper
						aria-label={`${cardinal.name} Patronage Effects`}
						className="mt-8">
						<TableHeader>
							{["Name","Description","Effects"].map((tc) => (
								<TableColumn
									key={tc}
									className="bg-transparent border-b-2 pl-0">
									{tc}
								</TableColumn>
							))}
						</TableHeader>
						<TableBody>
							{(cardinal.effects).map((effect) => (
								<TableRow key={effect.name}>
									<TableCell className="align-top pl-0">
										<ExternalLink
										href={`https://atom-magic.com/codex/${effect.page}`} name={effect.name} />
									</TableCell>
									<TableCell className="w-1/3 pl-0">{effect.description}</TableCell>
									<TableCell className="pl-0">{effect.levels.map((level) => (
										<dl key={level.name} className="flex">
											<dt className="uppercase w-12">{level.name}:</dt>
											<dd className="">{level.description}</dd>
										</dl>
									))}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				);
				setDetails(
					<SelectDetailExpanded
						imagePath={cardinal.svgSrc}
						name={`${cardinal.name}, ${cardinal.epithet}`}
						description={cardinal.description}
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
							{CARDINALS.map((cardinal) => (
						  	<SelectItem key={cardinal.value}>
								{cardinal.name}
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