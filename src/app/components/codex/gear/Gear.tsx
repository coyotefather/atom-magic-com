'use client';
import { useState, useEffect } from 'react';
import { GEAR_PAGE_QUERYResult } from "../../../../../sanity.types";
import {  Table,  TableHeader,  TableBody,  TableColumn,  TableRow,  TableCell, getKeyValue} from "@heroui/react";
import {Select, SelectItem} from "@heroui/select";
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
		gear: GEAR_PAGE_QUERYResult
	}) {

	const columns = [
		{
			key: "title",
			label: "NAME",
		},
		{
			key: "paths",
			label: "PATHS",
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
			key: "value",
			label: "VALUE",
		},
		{
			key: "modifiers",
			label: "MODIFIERS",
		},
		{
			key: "description",
			label: "DESCRIPTION",
		},
	];

	//let paths:{ _id: string, title: string | null }[] = [];
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

		// only build full locale array of gear once
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

				// build list of all paths of all gear items
				g.paths && g.paths.map( p => {
					p.title && !pathList.some( thisp => thisp._id === p._id ) ? pathList.push({ _id: p._id, title: p.title}) : undefined;
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
						g.paths && g.paths.map( p => {
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
				console.log('dmg');
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
			variant="bordered"
			radius="sm"
			size="sm"
			label="Path"
			className="max-w-xs"
			onChange={(e) => {
				setFilter({ column: "paths", value: e.target.value});
			}}
			defaultSelectedKeys={"all"}>
			{paths.map((p) => (
				<SelectItem key={p._id}>
					{p.title}
				</SelectItem>
			))}
		</Select>
		</div>
		<Table
			isCompact
			isStriped
			aria-label={`All Gear`}
			className="mt-8"
			classNames={
				{
					wrapper: 'bg-transparent shadow-none p-0',
					th: "",
				}
			}>
			<TableHeader columns={columns}>
				{(column) => (
					<TableColumn
						onClick={() => {
							if(!["description"].includes(column.key)) {
								setSort(column.key);
							}
						}}
						key={column.key}
						className={clsx(
							"bg-transparent border-b-2",
							{'hover:text-black cursor-pointer': !["description"].includes(column.key)}
						)}>
						<div className="flex flex-row gap-1 items-center">
							{column.label}
							{!["description"].includes(column.key) ? <Icon path={mdiSortAscending} size={0.75} /> : ""}
						</div>
					</TableColumn>
				)}
			  </TableHeader>
			<TableBody items={sortedGear}>
				{(item) => (
				  <TableRow key={item._id}>
					{(columnKey) => (
						<TableCell className="text-base align-top">{getKeyValue(item, columnKey)}
						</TableCell>
					)}
				  </TableRow>
				)}
			  </TableBody>
		</Table>
	</div>
  );
}