/**
 * Gear.tsx
 *
 * Legacy codex page component for displaying gear items in a filterable table.
 * This component is from the Sanity CMS era and uses the old `GEAR_PAGE_QUERY_RESULT`
 * type (typed as `any[]` since Sanity types were removed). The route that uses
 * this component (`/codex/gear/[slug]`) currently returns 404 and can be
 * deleted when convenient.
 *
 * NOTE: This is NOT the Character Manager's gear roller — that lives in
 * `src/app/components/character/sections/ManageGear.tsx` and uses data from
 * `src/lib/gear-data.ts`.
 *
 * Used by:
 *   - `src/app/(website)/codex/gear/[slug]/page.tsx` (legacy, currently 404)
 */
'use client';
import { useState, useEffect } from 'react';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GEAR_PAGE_QUERY_RESULT = any[];
import { Table, Select, Label, ListBox } from "@heroui/react";
import Icon from '@mdi/react';
import { mdiSortAscending } from '@mdi/js';
import { renderToString } from 'react-dom/server';
import clsx from 'clsx';
import GearModifiers from '@/app/components/codex/gear/GearModifiers';
import GearPaths from '@/app/components/codex/gear/GearPaths';

interface Gear {
	_id: string,
	title: string,
	damageBonus: number,
	shieldBonus: number,
	value: number,
	modifiers: React.ReactNode,
	paths: React.ReactNode,
	description: string,
};

interface Path {
	_id: string,
	title: string | null
};

export default function Gear({
		gear
	}: {
		gear: GEAR_PAGE_QUERY_RESULT
	}) {

	const columns = [
		{ key: "title", label: "NAME" },
		{ key: "paths", label: "PATHS" },
		{ key: "damageBonus", label: "DMG+" },
		{ key: "shieldBonus", label: "SHLD+" },
		{ key: "value", label: "VALUE" },
		{ key: "modifiers", label: "MODIFIERS" },
		{ key: "description", label: "DESCRIPTION" },
	];

	const [paths, setPaths] = useState<Path[]>([]);
	const [sortedGear, setSortedGear] = useState<Gear[]>([]);
	const [sort, setSort] = useState("title");
	const [filter, setFilter] = useState({
		column: "",
		value: ""
	});

	useEffect( () => {
		let unsortedGear:Gear[] = [];
		let updatedGear:Gear[] = [];
		let pathList:Path[] = [{ _id: "all", title: "All Paths"}];

		if(unsortedGear.length == 0 && filter.column === "" && filter.value === "") {
			gear.map( (g) => {
				let thisGear: Gear;
				thisGear = {
					_id: g._id,
					title: g.title ? g.title : "Gear",
					damageBonus: g.damageBonus ? g.damageBonus : 0,
					shieldBonus: g.shieldBonus ? g.shieldBonus : 0,
					value: g.value ? g.value : 0,
					modifiers: (<GearModifiers modifiers={g.modifiers} />),
					paths: (<GearPaths paths={g.paths} />),
					description: g.description ? g.description : "Gear",
				};
				unsortedGear.push(thisGear);

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				g.paths && g.paths.map( (p: any) => {
					p.title && !pathList.some( (thisp: Path) => thisp._id === p._id ) ? pathList.push({ _id: p._id, title: p.title}) : undefined;
				});
				setPaths(pathList);
			});
		}
		if (sortedGear.length > 0 && filter.column && filter.value) {
			gear.map( (g) => {
				let thisGear: Gear;
				let add = false;

				switch(filter.column) {
					case "paths":
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						g.paths && g.paths.map( (p: any) => {
							p._id === filter.value || filter.value === "all" ? add = true : undefined;
						});
						break;
					default:
						break;
				}

				if(add) {
					thisGear = {
						_id: g._id,
						title: g.title ? g.title : "Gear",
						damageBonus: g.damageBonus ? g.damageBonus : 0,
						shieldBonus: g.shieldBonus ? g.shieldBonus : 0,
						value: g.value ? g.value : 0,
						modifiers: (<GearModifiers modifiers={g.modifiers} />),
						paths: (<GearPaths paths={g.paths} />),
						description: g.description ? g.description : "Gear",
					};
					unsortedGear.push(thisGear);
				}
			});
		}

		updatedGear = unsortedGear;

		switch(sort) {
			case "title":
				updatedGear.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0))
				break;
			case "damageBonus":
				updatedGear.sort((a,b) => (a.damageBonus < b.damageBonus) ? 1 : ((b.damageBonus < a.damageBonus) ? -1 : 0))
				break;
			case "shieldBonus":
				updatedGear.sort((a,b) => (a.shieldBonus < b.shieldBonus) ? 1 : ((b.shieldBonus < a.shieldBonus) ? -1 : 0))
				break;
			case "value":
				updatedGear.sort((a,b) => (a.value < b.value) ? 1 : ((b.value < a.value) ? -1 : 0))
				break;
			case "modifiers":
				updatedGear.sort((a,b) => (renderToString(a.modifiers) > renderToString(b.modifiers)) ? 1 : (( renderToString(b.modifiers) > renderToString(a.modifiers) ) ? -1 : 0))
				break;
			case "path":
				updatedGear.sort((a,b) => ( renderToString(a.paths) > renderToString(b.paths) ) ? 1 : (( renderToString(b.paths) > renderToString(a.paths) ) ? -1 : 0))
				break;
			default:
				break;
		}
		setSortedGear(updatedGear);
	},[sort, filter, gear, sortedGear.length]);

  return (
	<div className="container notoserif my-16">
		<div className="flex justify-end">
			<Select
				defaultValue="all"
				onChange={(val) => setFilter({ column: "paths", value: val ? String(val) : "" })}
				className="max-w-xs"
			>
				<Label>Path</Label>
				<Select.Trigger>
					<Select.Value />
					<Select.Indicator />
				</Select.Trigger>
				<Select.Popover>
					<ListBox>
						{paths.map((p) => (
							<ListBox.Item key={p._id} id={p._id} textValue={p.title ?? ""}>
								{p.title}
								<ListBox.ItemIndicator />
							</ListBox.Item>
						))}
					</ListBox>
				</Select.Popover>
			</Select>
		</div>
		<Table>
			<Table.ScrollContainer>
				<Table.Content aria-label="All Gear" className="mt-8">
					<Table.Header>
						{columns.map((column) => (
							<Table.Column
								key={column.key}
								id={column.key}
								onClick={() => {
									if (!["description"].includes(column.key)) {
										setSort(column.key);
									}
								}}
								className={clsx(
									"bg-transparent border-b-2",
									{ 'hover:text-black cursor-pointer': !["description"].includes(column.key) }
								)}
							>
								<div className="flex flex-row gap-1 items-center">
									{column.label}
									{!["description"].includes(column.key) ? <Icon path={mdiSortAscending} size={0.75} /> : ""}
								</div>
							</Table.Column>
						))}
					</Table.Header>
					<Table.Body>
						{sortedGear.map((item) => (
							<Table.Row key={item._id} id={item._id}>
								<Table.Cell className="text-base align-top">{item.title}</Table.Cell>
								<Table.Cell className="text-base align-top">{item.paths}</Table.Cell>
								<Table.Cell className="text-base align-top">{item.damageBonus}</Table.Cell>
								<Table.Cell className="text-base align-top">{item.shieldBonus}</Table.Cell>
								<Table.Cell className="text-base align-top">{item.value}</Table.Cell>
								<Table.Cell className="text-base align-top">{item.modifiers}</Table.Cell>
								<Table.Cell className="text-base align-top">{item.description}</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Content>
			</Table.ScrollContainer>
		</Table>
	</div>
  );
}
