'use client';
import { useState, useRef } from 'react';
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import ExternalLink from '@/app/components/common/ExternalLink';
import FunctionButton from '@/app/components/common/FunctionButton';
import { PATHS } from '@/app/lib/global-data';
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue} from "@nextui-org/react";
import clsx from 'clsx';
import { mdiDiceMultiple } from '@mdi/js';
import { CSSTransition, SwitchTransition } from "react-transition-group";

const ManageGear = () => {
	const detailsRef = useRef(null);

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

	let rollGear = () => {
		console.log("roll gear");
	};

	const handleSelectChange = (event: React.ChangeEvent) => {
		let val = (event.target as HTMLInputElement).value;
		let modifiers = (<></>);
		let nameWithUnderscores = "";
		if(val !== "") {
			setDetailsUpdated(curDetailsUpdated => !curDetailsUpdated);
			let path = PATHS.find((path) => path.value === val);
			let allModifiers: {
				parentName: string,
				page: string,
				id: string,
				name: string,
				parentId: string,
				value: number
			}[] = [];
			if(path != undefined) {
				path.modifiers.map((subscore) => {
					subscore.modifier.map((m) => {
						if(m.value != 0) {
							nameWithUnderscores = m.name.replace(/ /g,"_");
							allModifiers.push({
								parentName: subscore.name,
								page: `${subscore.name}#${nameWithUnderscores}`,
								...m
							});
						}
					});
				});

				modifiers = (
					<div className="dark">
						<Table removeWrapper aria-label={`${path.name} Modifiers`}>
							<TableHeader>
								{["Score","Subscore","Modifier"].map((tc) => (
									<TableColumn
										key={tc}
										className="marcellus text-white text-md bg-transparent border-b-2 border-white">
										{tc}
									</TableColumn>
								))}
							</TableHeader>
							<TableBody>
								{allModifiers.map((m) => (
									<TableRow key={m.id}>
										<TableCell>
											{m.parentName}
										</TableCell>
										<TableCell className="text-base">
											<ExternalLink
											href={`https://atom-magic.com/codex/${m.page}`} name={m.name} />
										</TableCell>
										<TableCell className={clsx(
											'',
											{
												'text-adobe': m.value < 0
											},
											{
												'text-olive-green': m.value > 0
											},
										)}>
											{m.value > 0 ? "+" : ""}
											{m.value}
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
						name={path.name}
						description={path.description}
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
					<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">Roll Gear</h2>
					<p className="pb-2">
						Every character starts with a basic gear kit and rolls additional unique items and wealth.
					</p>
					<div className="m-auto mt-4">
						<FunctionButton
						buttonFunction={rollGear}
						buttonIcon={mdiDiceMultiple}
						iconOnly={false}
						variant="secondary">Roll Gear</FunctionButton>
					</div>
				</div>
			</div>
			<div className="pt-16 pb-16">
				<div className="max-w-[768px] pl-4">
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

export default ManageGear;