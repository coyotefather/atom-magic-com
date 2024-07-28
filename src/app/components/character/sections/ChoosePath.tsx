'use client';
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import ExternalLink from '@/app/components/common/ExternalLink';
import { PATHS } from '@/app/lib/global-data';
import {Select, SelectSection, SelectItem} from "@nextui-org/select";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue} from "@nextui-org/react";
import { useState, useRef } from 'react';
import clsx from 'clsx';
import { CSSTransition, SwitchTransition } from "react-transition-group";

const ChoosePath = () => {
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
						imagePath="/atom-magic-circle-white.png"
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
		<div className="grid grid-cols-2">
			<div className="flex justify-end pt-16 pb-16">
				<div className="max-w-[673px] pr-4">
					<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">Choose a Path</h2>
					<p className="pb-2">
						Paths indicate how your character came to be skilled in the arts of atom magic. While many techniques are common to all three, some are specific to each path.
					</p>
					<p>
						For more information, see <a href="https://atom-magic.com/codex/Paths" title="Paths">Character paths</a>.
					</p>
					<div className="m-auto">
						<Select
							isRequired
							variant="bordered"
							radius="sm"
							label="Path"
							placeholder="Select a Path"
							className="w-96 mt-8"
							onChange={(event) => handleSelectChange(event)}
					  	>
							{PATHS.map((path) => (
						  	<SelectItem key={path.value}>
								{path.name}
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

export default ChoosePath;