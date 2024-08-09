'use client';
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@nextui-org/react";
import {Accordion, AccordionItem} from "@nextui-org/accordion";
import {Chip} from "@nextui-org/chip";
import Icon from '@mdi/react';
import { mdiChevronLeftCircle, mdiBankCircleOutline } from '@mdi/js';
import clsx from 'clsx';

const columns = [
	{
		key: "name",
		label: "Name",
	},
	{
		key: "damageBonus",
		label: "DMG+",
	},
	{
		key: "shieldBonus",
		label: "SHLD+",
	},
	{
		key: "modifiers",
		label: "Modifiers",
	},
];

const GearTable = ({
		gear
	}: {
		gear: {
			name: string,
			key: string,
			latin: string,
			description: string,
			type: string,
			damageBonus: number,
			shieldBonus: number,
			modifiers: {
				key: string,
				parent: string,
				child: string,
				value: number,
			}[],
			value: number
		}[],
	}) => {

	return (
		<Table isCompact removeWrapper aria-label="Gear">
			<TableHeader
				columns={columns}
				className="marcellus text-md">
				{(column) => (
					<TableColumn
						className={clsx(
							"bg-transparent border-b-2",
							{"pl-0": column.key === "name"},
							{"max-w-8": ["dmg+","shld+"].includes(column.key) },
							{"max-w-28": column.key === "modifiers"},
						)}
						key={column.key}>{column.label}</TableColumn>
				)}
			</TableHeader>
			<TableBody items={gear}>
				{gear.map( (g) => (
					<TableRow key={g.key} className="pb-16">
						<TableCell className="pl-0 max-w-44">
							<Accordion
								isCompact
								className="border-0 focus:border-0 outline-none focus:outline-none pl-0 pr-0"
								itemClasses={
									{
										base: 'p-0 text-small',
										title: 'font-bold text-left text-small',
										trigger: 'p-0',
										indicator: "text-left",
									}
								}
								fullWidth>
								<AccordionItem
									key={`${g.key}_info`}
									aria-label={`${g.name} Description`}
									indicator={<Icon path={mdiChevronLeftCircle} size={0.75} />}
									title={g.name}>
									<div>
										<div className="mb-8">
											<div className="flex gap-2 pt-1 mb-2">
												<Chip
													size="sm"
													classNames={{
														base: "bg-black",
														content: "capitalize text-white",
											  		}}>{g.type}</Chip>
												<Chip
													size="sm"
													startContent={<Icon path={mdiBankCircleOutline} size={0.75} />}
													classNames={{
														base: "bg-brightgold",
														content: "capitalize text-black",
												  	}}>
													{g.value}</Chip>
											</div>
											<div className="marcellus">
												{g.latin}
											</div>
											<div>
												{g.description}
											</div>
										</div>
									</div>
								</AccordionItem>
							</Accordion>
						</TableCell>
						{[g.damageBonus, g.shieldBonus].map((d, index) => (
							<TableCell
								key={`${d}-${index}`}
								className={clsx(
									"capitalize max-w-8 align-top",
									{ "font-bold text-dark-olive-green" : d > 0 },
									{ "font-bold text-adobe" : d < 0 },
								)}>
								{ d > 0 ? `+${d}` : "" }
								{ d < 0 || !Number.isInteger(d) ? d : "" }
								{ d === 0 ? "-" : "" }
							</TableCell>
						))}
						<TableCell className="max-w-28 align-top">
							{g.modifiers.map( (gm, index) => (
								<div className={clsx(
									"grid grid-cols-2 capitalize",
									{ "border-b-1" : index % 2 == 0 && g.modifiers.length > 1 }
								)} key={gm.key}>
									<div>{gm.child}</div>
									<div className={clsx(
										"",
										{ "font-bold text-dark-olive-green" : gm.value > 0 },
										{ "font-bold text-adobe" : gm.value < 0 },
									)}>
										{gm.value > 0 ? "+" : ""}
										{gm.value}
									</div>
								</div>
							))}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export default GearTable;