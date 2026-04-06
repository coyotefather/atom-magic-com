'use client';
import { Table, Accordion, Chip } from "@heroui/react";
import clsx from 'clsx';
import type { CharacterGearItem } from '@/lib/gear-data';

const columns = [
	{ key: "name", label: "Name" },
	{ key: "stats", label: "Stats" },
	{ key: "enhancement", label: "Enhancement" },
];

const GearTable = ({ gear }: { gear: CharacterGearItem[] }) => {
	return (
		<Table>
			<Table.ScrollContainer>
				<Table.Content aria-label="Gear">
					<Table.Header className="marcellus text-md">
						{columns.map((column) => (
							<Table.Column
								key={column.key}
								id={column.key}
								className={clsx("bg-transparent border-b-2", { "pl-0": column.key === "name" })}
							>
								{column.label}
							</Table.Column>
						))}
					</Table.Header>
					<Table.Body>
						{gear.map((g) => (
							<Table.Row key={g.id} id={g.id} className="pb-16">
								<Table.Cell className="pl-0 w-56">
									<Accordion className="border-0 outline-hidden pl-0 pr-0 w-full">
										<Accordion.Item>
											<Accordion.Heading className="pl-0 pr-0">
												<Accordion.Trigger className="p-0 border-0" aria-label={`${g.name} Description`}>
													<span className="font-bold text-left text-small">{g.name}</span>
													<Accordion.Indicator />
												</Accordion.Trigger>
											</Accordion.Heading>
											<Accordion.Panel>
												<Accordion.Body className="pl-0 pr-0">
													<div className="mb-4">
														<div className="flex gap-2 pt-1 mb-2">
															<Chip size="sm" className="bg-black capitalize text-white">{g.type}</Chip>
															<Chip size="sm" className="bg-parchment capitalize text-black">{g.category}</Chip>
															<Chip size="sm" className="bg-stone/20 capitalize text-stone-dark">Tier {g.tier}</Chip>
															{g.isExotic && <Chip size="sm" className="bg-gold/20 text-gold">Exotic</Chip>}
														</div>
														{g.description && <div className="text-sm text-stone">{g.description}</div>}
													</div>
												</Accordion.Body>
											</Accordion.Panel>
										</Accordion.Item>
									</Accordion>
								</Table.Cell>
								<Table.Cell className="align-top text-sm">
									{g.damage && <div><span className="text-stone text-xs uppercase tracking-wider">DMG </span>{g.damage}</div>}
									{g.capacity != null && <div><span className="text-stone text-xs uppercase tracking-wider">CAP </span>{g.capacity}</div>}
									{g.penalties && <div className="text-stone text-xs">{g.penalties}</div>}
									{(g.physicalShieldBonus != null && g.physicalShieldBonus !== 0) && (
										<div className={clsx({ "text-laurel font-bold": g.physicalShieldBonus > 0, "text-oxblood font-bold": g.physicalShieldBonus < 0 })}>
											PHY {g.physicalShieldBonus > 0 ? `+${g.physicalShieldBonus}` : g.physicalShieldBonus}
										</div>
									)}
									{(g.psychicShieldBonus != null && g.psychicShieldBonus !== 0) && (
										<div className={clsx({ "text-laurel font-bold": g.psychicShieldBonus > 0, "text-oxblood font-bold": g.psychicShieldBonus < 0 })}>
											PSY {g.psychicShieldBonus > 0 ? `+${g.psychicShieldBonus}` : g.psychicShieldBonus}
										</div>
									)}
								</Table.Cell>
								<Table.Cell className="max-w-28 align-top text-sm">
									{g.enhancement && (
										<div>
											<div className="font-semibold">{g.enhancement.name}</div>
											{g.enhancement.description && <div className="text-stone text-xs">{g.enhancement.description}</div>}
										</div>
									)}
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
