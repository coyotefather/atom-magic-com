'use client';
import { useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/lib/hooks'
import { setGear } from "@/app/lib/slices/characterSlice";
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import GearTable from '@/app/components/character/sections/gear/GearTable'
import ExternalLink from '@/app/components/common/ExternalLink';
import FunctionButton from '@/app/components/common/FunctionButton';
import { GEAR } from '@/app/lib/global-data';
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue} from "@nextui-org/react";
import clsx from 'clsx';
import { mdiDiceMultiple } from '@mdi/js';
import { CSSTransition, SwitchTransition } from "react-transition-group";

const ManageGear = () => {

	// function via Mozilla docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
	function getRandomInt(min: number, max: number) {
		const minCeiled = Math.ceil(min);
		const maxFloored = Math.floor(max);
		return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
	}

	const detailsRef = useRef(null);
	const gear = useAppSelector(state => state.character.gear);
	const dispatch = useAppDispatch();

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
		// hardcode path for now
		const pathId = "theurgist";
		// all three are arrays of objects
		const weaponsList = GEAR.weapons[pathId];
		const armorList = GEAR.armor[pathId];
		const otherList = GEAR.other;

		const weapon = weaponsList[ getRandomInt(0, (weaponsList.length) )];
		const armor = armorList[ getRandomInt(0, (armorList.length) )];
		const allGear = [
			weapon,
			armor,
			...otherList
		];
		let content = (<></>);

		if(weapon && armor && otherList) {
			dispatch(setGear(allGear));
			content = (
				<GearTable gear={allGear} />
			);
			setDetailsUpdated(curDetailsUpdated => !curDetailsUpdated);
			setDetails(
				<SelectDetailExpanded
					imagePath=""
					name="Gear"
					description=""
					disabled={false}>
					{content}
				</SelectDetailExpanded>);
		}
	};

	return (
		<div className="grid grid-cols-2 divide-x-2 bg-white">
			<div className="flex justify-end pt-16 pb-16">
				<div className="max-w-[673px] pr-4">
					<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">Roll Gear</h2>
					<p className="pb-2">
						Every character starts with a basic gear kit and rolls additional unique items based on the chosen path. Some gear will also grant modifiers to scores, giving you further benefits or even penalties.
					</p>
					<div className="m-auto mt-4">
						<FunctionButton
							isDisabled={detailsUpdated}
							buttonFunction={rollGear}
							buttonIcon={mdiDiceMultiple}
							iconOnly={false}
							variant="bordered">Roll Gear</FunctionButton>
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

export default ManageGear;