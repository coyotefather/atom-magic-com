'use client';
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@heroui/react";
import {Accordion, AccordionItem} from "@heroui/react";
import {Chip} from "@heroui/react";
import Icon from '@mdi/react';
import { mdiChevronLeftCircle, mdiBankCircleOutline } from '@mdi/js';
import clsx from 'clsx';
import {
	GEAR_QUERYResult,
} from "../../../../../../sanity.types";

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
		gear: GEAR_QUERYResult,
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
					<TableRow key={g._id} className="pb-16">
						<TableCell className="pl-0 w-56">
							<Accordion
								isCompact
								className="border-0 focus:border-0 outline-hidden focus:outline-hidden pl-0 pr-0"
								itemClasses={
									{
										base: 'p-0 text-small',
										title: 'font-bold text-left text-small',
										trigger: 'p-0 border-0',
										indicator: "text-left",
									}
								}
								fullWidth>
								<AccordionItem
									key={`${g._id}_info`}
									aria-label={`${g.title} Description`}
									indicator={<Icon path={mdiChevronLeftCircle} size={0.75} />}
									title={g.title}>
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
						<TableCell
							className={clsx(
								"capitalize w-8 align-top",
								{ "font-bold text-laurel" : g.damageBonus && g.damageBonus > 0 },
								{ "font-bold text-oxblood" : g.damageBonus && g.damageBonus < 0 },
							)}>
							{g.damageBonus && g.damageBonus > 0 ? `+${g.damageBonus}` : "" }
							{g.damageBonus && g.damageBonus < 0 || g.damageBonus === 0 ? g.damageBonus : "" }
						</TableCell>
						<TableCell
							className={clsx(
								"capitalize max-w-8 align-top",
								{ "font-bold text-laurel" : g.shieldBonus && g.shieldBonus > 0 },
								{ "font-bold text-oxblood" : g.shieldBonus && g.shieldBonus < 0 },
							)}>
							{ g.shieldBonus && g.shieldBonus > 0 ? `+${g.shieldBonus}` : "" }
							{ g.shieldBonus && g.shieldBonus < 0 || g.shieldBonus === 0 ? g.shieldBonus : "" }
						</TableCell>
						<TableCell className="max-w-28 align-top">
							{g.modifiers && g.modifiers.map( (gm, index) => (
								<div className={clsx(
									"grid grid-cols-2 capitalize",
									{ "border-b-1" : index % 2 == 0 && g.modifiers && g.modifiers.length > 1 }
								)} key={`m-${index}`}>
									<div>{gm.modifierSubscore && gm.modifierSubscore.title ? gm.modifierSubscore.title : ""}</div>
									<div className={clsx(
										"",
										{ "font-bold text-laurel" : gm.modifierValue && gm.modifierValue > 0 },
										{ "font-bold text-oxblood" : gm.modifierValue && gm.modifierValue < 0 },
									)}>
										{gm.modifierValue && gm.modifierValue > 0 ? "+" : ""}
										{gm.modifierValue}
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