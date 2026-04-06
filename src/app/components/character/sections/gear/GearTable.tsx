'use client';
import { Table, Accordion, Chip } from "@heroui/react";
import Icon from '@mdi/react';
import { mdiBankCircleOutline } from '@mdi/js';
import clsx from 'clsx';
import type { CharacterGearItem } from '@/lib/gear-data';

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
		gear: CharacterGearItem[],
	}) => {

	return (
		<Table>
			<Table.ScrollContainer>
				<Table.Content aria-label="Gear">
					<Table.Header className="marcellus text-md">
						{columns.map((column) => (
							<Table.Column
								key={column.key}
								id={column.key}
								className={clsx(
									"bg-transparent border-b-2",
									{"pl-0": column.key === "name"},
									{"max-w-8": ["dmg+","shld+"].includes(column.key) },
									{"max-w-28": column.key === "modifiers"},
								)}
							>
								{column.label}
							</Table.Column>
						))}
					</Table.Header>
					<Table.Body>
						{gear.map((g) => (
							<Table.Row key={g._id} id={g._id} className="pb-16">
								<Table.Cell className="pl-0 w-56">
									<Accordion className="border-0 outline-hidden pl-0 pr-0 w-full">
										<Accordion.Item>
											<Accordion.Heading className="pl-0 pr-0">
												<Accordion.Trigger className="p-0 border-0" aria-label={`${g.title} Description`}>
													<span className="font-bold text-left text-small">{g.title}</span>
													<Accordion.Indicator />
												</Accordion.Trigger>
											</Accordion.Heading>
											<Accordion.Panel>
												<Accordion.Body className="pl-0 pr-0">
													<div>
														<div className="mb-8">
															<div className="flex gap-2 pt-1 mb-2">
																<Chip size="sm" className="bg-black capitalize text-white">
																	{g.type}
																</Chip>
																<Chip size="sm" className="bg-brightgold capitalize text-black">
																	<Icon path={mdiBankCircleOutline} size={0.75} />
																	{g.value}
																</Chip>
															</div>
															<div className="marcellus">
																{g.latin}
															</div>
															<div>
																{g.description}
															</div>
														</div>
													</div>
												</Accordion.Body>
											</Accordion.Panel>
										</Accordion.Item>
									</Accordion>
								</Table.Cell>
								<Table.Cell
									className={clsx(
										"capitalize w-8 align-top",
										{ "font-bold text-laurel" : g.damageBonus && g.damageBonus > 0 },
										{ "font-bold text-oxblood" : g.damageBonus && g.damageBonus < 0 },
									)}>
									{g.damageBonus && g.damageBonus > 0 ? `+${g.damageBonus}` : "" }
									{g.damageBonus && g.damageBonus < 0 || g.damageBonus === 0 ? g.damageBonus : "" }
								</Table.Cell>
								<Table.Cell
									className={clsx(
										"capitalize max-w-8 align-top",
										{ "font-bold text-laurel" : g.shieldBonus && g.shieldBonus > 0 },
										{ "font-bold text-oxblood" : g.shieldBonus && g.shieldBonus < 0 },
									)}>
									{ g.shieldBonus && g.shieldBonus > 0 ? `+${g.shieldBonus}` : "" }
									{ g.shieldBonus && g.shieldBonus < 0 || g.shieldBonus === 0 ? g.shieldBonus : "" }
								</Table.Cell>
								<Table.Cell className="max-w-28 align-top">
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
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Content>
			</Table.ScrollContainer>
		</Table>
	);
};

export default GearTable;
