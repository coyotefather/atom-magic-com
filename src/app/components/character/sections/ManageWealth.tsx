'use client';
import { useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/lib/hooks'
import { setWealth } from "@/app/lib/slices/characterSlice";
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import FunctionButton from '@/app/components/common/FunctionButton';
import { WEALTH } from '@/app/lib/global-data';
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@nextui-org/react";
import clsx from 'clsx';
import { mdiDiceMultiple } from '@mdi/js';
import { CSSTransition, SwitchTransition } from "react-transition-group";

const ManageGear = ({
		incompleteFields
	}: {
		incompleteFields: string
	}) => {

	// function via Mozilla docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
	function getRandomInt(min: number, max: number) {
		const minCeiled = Math.ceil(min);
		const maxFloored = Math.floor(max);
		return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
	}

	const detailsRef = useRef(null);
	const wealth = useAppSelector(state => state.character.wealth);
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

	const handleClick = () => {
		if(wealth && WEALTH) {
			rollWealth();
		} else {
			// show error
			console.log("Error reading store.");
		}
	};

	let rollWealth = () => {
		// all three are arrays of objects
		let content = (<></>);
		let rolledWealth = {
			silver: 0,
			gold: 0,
			lead: 0,
			uranium: 0
		};
		//roll wealth
		rolledWealth.silver = getRandomInt(1, 100);
		rolledWealth.gold = getRandomInt(1, 10);
		rolledWealth.lead = getRandomInt(1, 20);
		rolledWealth.uranium = getRandomInt(1, 10);

		if(rolledWealth) {
			dispatch(setWealth(rolledWealth));

			// generate content

			content = (
				<div>
					<Table isCompact removeWrapper aria-label="Wealth">
						<TableHeader>
							{["Name","Description","Type","Quantity"].map((tc) => (
								<TableColumn key={tc} className="bg-transparent border-b-2 pl-0">
									{tc}
								</TableColumn>
							))}
						</TableHeader>
						<TableBody>
							{WEALTH.map( (w) => (
								<TableRow key={w.id}>
									<TableCell className="align-top pl-0 font-bold">
										{w.name}
									</TableCell>
									<TableCell className="align-top pl-0 max-w-36">
										{w.description}
									</TableCell>
									<TableCell className="align-top pl-0 capitalize">
										{w.type}
									</TableCell>
									<TableCell className="align-top pl-0 font-bold">
										{rolledWealth[w.id as keyof typeof rolledWealth]}
									</TableCell>
								</TableRow>
							) )}
						</TableBody>
					</Table>
				</div>
			);

			setDetailsUpdated(curDetailsUpdated => !curDetailsUpdated);
			setDetails(
				<SelectDetailExpanded
					imagePath=""
					name="Wealth"
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
					<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">Roll Wealth</h2>
					<p className="pb-2">
						Your character will have two types of wealth: currency and resources. The former is used as you&apos;d expect, whereas the latter can be used to make items or be traded for currency.
					</p>
					<div className="m-auto mt-4">
						<div className={clsx(
							"inline-block",
							{"border-2 rounded-full border-danger": incompleteFields && incompleteFields !== "init"},
						)}>
							<FunctionButton
								isDisabled={detailsUpdated}
								buttonFunction={handleClick}
								buttonIcon={mdiDiceMultiple}
								iconOnly={false}
								variant="secondary">Roll Wealth</FunctionButton>
						</div>
						<div className={clsx(
							"text-tiny text-danger mt-2",
							{"hidden": !incompleteFields || incompleteFields === "init"},
							{"display-block": incompleteFields && incompleteFields !== "init"},
						)}>Please roll wealth for your character.</div>
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