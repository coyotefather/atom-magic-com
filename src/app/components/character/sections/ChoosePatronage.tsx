'use client';
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import { CARDINALS } from '@/app/lib/global-data';
import {Select, SelectSection, SelectItem} from "@nextui-org/select";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue} from "@nextui-org/react";
import { useState, useRef } from 'react';
import { CSSTransition, SwitchTransition } from "react-transition-group";


const ChoosePatronage = () => {
	const detailsRef = useRef(null);
	const [detailsUpdated, setDetailsUpdated] = useState(false);
	const [details, setDetails] = useState(
		<SelectDetailExpanded
			imagePath=""
			name="Choose a Patron"
			description="Select an option from the dropdown."
			disabled={true} />
	);
	//const [patronageEffects, setPatronageEffects] = useState(<div>test</div>);
	const columns = [
		{
			key: "name",
			label: "Name",
		},
		{
			key: "description",
			label: "Description",
		},
	];

	const handleSelectChange = (event: React.ChangeEvent) => {
		let val = (event.target as HTMLInputElement).value;
		let patronageEffects = (<></>);
		if(val !== "") {
			setDetailsUpdated(detailsUpdated => !detailsUpdated);
			let cardinal = CARDINALS.find((cardinal) => cardinal.value === val);
			if(cardinal != undefined) {
				console.log(cardinal);
				patronageEffects = (
					<div className="dark">
						<Table aria-label="Example table with dynamic content">
							<TableHeader columns={columns}>
								{(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
							</TableHeader>
							<TableBody items={cardinal.effects}>
								{(item) => (
									<TableRow key={item.key}>
										{(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				);
				setDetails(
					<SelectDetailExpanded
						imagePath={cardinal.svgSrc}
						name={cardinal.name}
						description={cardinal.description}
						disabled={false}>
						jhbjhbj
						{patronageEffects}
					</SelectDetailExpanded>
				);
			}
		}
	};

	return (
		<div className="grid grid-cols-2">
			<div className="flex justify-end pt-16 pb-16">
				<div className="max-w-[673px] pr-4">
					<h2 className="marcellus text-3xl w-full border-b-2 border-solid mb-4">Choose a Patron</h2>
					<p className="pb-2 w-full">
						Optionally choose a patronage from a Cardinal. This doesn&apos;t directly affect your base or calculated scores but can affect actions you take.
					</p>
					<p className="pb-2 w-full">
						For more information, see <a href="https://atom-magic.com/codex/Cardinal_Forces" title="Paths">Cardinal Forces</a>.
					</p>
					<div className="m-auto w-full">
						<Select
							isRequired
							variant="bordered"
							radius="sm"
							label="Path"
							placeholder="Select a Path"
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
			<div className="bg-black text-white pt-16 pb-16">
				<div className="max-w-[768px] pl-4">
					<SwitchTransition mode="out-in">
						<CSSTransition
							key={detailsUpdated ? "x" : "y"}
							nodeRef={detailsRef}
							timeout={300}
							classNames='fade'
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