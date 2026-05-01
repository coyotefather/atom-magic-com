/**
 * ManageWealth.tsx
 *
 * The eighth wizard section where the player rolls their character's starting wealth.
 * Like gear, wealth is randomly determined rather than manually assigned, reflecting
 * the tabletop RPG convention of rolling for starting resources.
 *
 * The Atom Magic wealth system has four denominations, each rolled on a different range:
 *   - Silver: 1–99 (common currency)
 *   - Gold: 1–9 (valuable currency)
 *   - Lead: 1–19 (common crafting resource)
 *   - Uranium: 1–9 (rare magical resource)
 *
 * Denomination data (names, descriptions, types) comes from the `WEALTH` constant in
 * `global-data.ts`. The random values are generated with a local `getRandomInt(min, max)`
 * helper (inclusive min, exclusive max, per MDN convention).
 *
 * Once the roll button is clicked:
 *   1. Four random values are generated.
 *   2. `setWealth(rolledWealth)` is dispatched to Redux.
 *   3. The right panel updates with an animated HeroUI Table showing all four
 *      denominations with name, description, type, and quantity columns.
 *   4. The "Roll Wealth" button becomes disabled (`isDisabled={detailsUpdated}`) so it
 *      can only be rolled once (re-rolling would require a page refresh).
 *
 * Note: The component is exported as `ManageGear` in the source — this is a naming
 * inconsistency left from an early copy-paste; the component is for wealth management.
 *
 * Props:
 *   - incompleteFields: validation error string; shown if user advances without rolling
 *
 * Used by:
 *   - Sections.tsx (eighth wizard section, unlocked after ManageGear)
 */
'use client';
import { useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setWealth } from "@/lib/slices/characterSlice";
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import FunctionButton from '@/app/components/common/FunctionButton';
import { WEALTH } from '@/lib/global-data';
import { Table } from "@heroui/react";
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
				<div className="overflow-x-auto">
					<Table>
						<Table.ScrollContainer>
							<Table.Content aria-label="Wealth">
								<Table.Header>
									{["Name","Description","Type","Quantity"].map((tc) => (
										<Table.Column key={tc} id={tc} className="bg-transparent border-b-2 pl-0 font-bold">
											{tc}
										</Table.Column>
									))}
								</Table.Header>
								<Table.Body>
									{WEALTH.map((w) => (
										<Table.Row key={w.id} id={w.id}>
											<Table.Cell className="align-top pl-0 font-bold">
												{w.name}
											</Table.Cell>
											<Table.Cell className="align-top pl-0 max-w-36">
												{w.description}
											</Table.Cell>
											<Table.Cell className="align-top pl-0 capitalize">
												{w.type}
											</Table.Cell>
											<Table.Cell className="align-top pl-0 font-bold">
												{rolledWealth[w.id as keyof typeof rolledWealth]}
											</Table.Cell>
										</Table.Row>
									))}
								</Table.Body>
							</Table.Content>
						</Table.ScrollContainer>
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
		<div className="grid grid-cols-1 md:grid-cols-2 md:divide-x-2 bg-white">
			<div className="flex justify-center md:justify-end py-8 md:py-16 px-4 md:px-0">
				<div className="max-w-[673px] md:pr-4">
					<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">Roll Wealth</h2>
					<p className="pb-2">
						Your character will have two types of wealth: currency and resources. The former is used as you&apos;d expect, whereas the latter can be used to make items or be traded for currency.
					</p>
					<div className="m-auto mt-4">
						<div className={clsx(
							"inline-block",
							{"border-2 border-danger": incompleteFields && incompleteFields !== "init"},
						)}>
							<FunctionButton
								isDisabled={detailsUpdated}
								onClick={handleClick}
								icon={mdiDiceMultiple}
								variant="primary"
							>
								Roll Wealth
							</FunctionButton>
						</div>
						<div className={clsx(
							"text-tiny text-danger mt-2",
							{"hidden": !incompleteFields || incompleteFields === "init"},
							{"display-block": incompleteFields && incompleteFields !== "init"},
						)}>Please roll wealth for your character.</div>
					</div>
				</div>
			</div>
			<div className="py-8 md:py-16 px-4 md:px-0">
				<div className="max-w-[673px] md:pl-4">
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