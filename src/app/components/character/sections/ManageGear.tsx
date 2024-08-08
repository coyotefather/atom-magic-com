'use client';
import { useState, useRef } from 'react';
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import ExternalLink from '@/app/components/common/ExternalLink';
import FunctionButton from '@/app/components/common/FunctionButton';
import { GEAR } from '@/app/lib/global-data';
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue} from "@nextui-org/react";
import clsx from 'clsx';
import { mdiDiceMultiple } from '@mdi/js';
import { CSSTransition, SwitchTransition } from "react-transition-group";

const ManageGear = () => {

	// function via Mozilla docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
	function getRandomInt(min, max) {
		const minCeiled = Math.ceil(min);
		const maxFloored = Math.floor(max);
		return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
	}


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
		// hardcode path for now
		const pathId = "theurgist";
		// all three are arrays of objects
		const weaponsList = GEAR.weapons[pathId];
		const armorList = GEAR.armor[pathId];
		const otherList = GEAR.other;

		const weapon = weaponsList[ getRandomInt(0, (weaponsList.length) )];
		const armor = armorList[ getRandomInt(0, (armorList.length) )];
		let content = (<></>);

		if(weapon && armor && otherList) {
			content = (
				<div>
					<Table removeWrapper hideHeader aria-label="Gear">
						<TableHeader>
							{["Gear","Details"].map((tc) => (
								<TableColumn
									key={tc}
									className="marcellus text-md bg-transparent border-b-2">
									{tc}
								</TableColumn>
							))}
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell className="flex justify-start pl-0">
									{weapon.name}
								</TableCell>
								<TableCell>
									{weapon.description}
									<h4 className="border-b-2 mt-4 mb-2 font-semibold">Weapon Modifiers</h4>
									{weapon.modifiers.map( (wm, index) => (
										<div className={clsx(
											"grid grid-cols-2 capitalize",
											{ "border-b-1" : index % 2 == 0 && weapon.modifiers.length > 1 }
										)} key={wm.child}>
											<div>{wm.child}</div>
											<div className={clsx(
												"",
												{ "text-olive-green" : wm.value > 0 },
												{ "text-adobe" : wm.value < 0 },
											)}>
												{wm.value > 0 ? "+" : ""}
												{wm.value}
											</div>
										</div>
									))}
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>
									{armor.name}
								</TableCell>
								<TableCell>
									{armor.description}
									{armor.modifiers.map( (am) => (
										<div key={am.child}>
											{am.child} - {am.value}
										</div>
									))}
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</div>
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
						Every character starts with a basic gear kit and rolls additional unique items and wealth.
					</p>
					<div className="m-auto mt-4">
						<FunctionButton
							isDisabled={detailsUpdated}
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