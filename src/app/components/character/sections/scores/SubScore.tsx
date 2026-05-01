/**
 * SubScore.tsx
 *
 * The individual subscore control — the atomic unit of score adjustment in the
 * Character Manager. Each subscore (e.g., Strength, Agility within Physical) is
 * rendered as a row with a label, a minus button, the current calculated value,
 * and a plus button. Below the value row is a collapsible "Modifiers" accordion
 * that breaks down how the displayed number was reached.
 *
 * Three layers of value are tracked in local state:
 *   - `baseSubscoreValue`: the raw points the player has allocated to this subscore
 *     (starts at the value from Redux, incremented/decremented by +/– buttons).
 *   - `pathModifierTotal`: sum of all path modifiers affecting this subscore
 *     (computed in a useEffect watching the `pathModifiers` prop).
 *   - `gearModifierTotal`: sum of all gear modifiers affecting this subscore
 *     (computed in a useEffect watching the `gearModifiers` prop).
 *   - `calcSubscoreValue` = baseSubscoreValue + pathModifierTotal + gearModifierTotal
 *     (the displayed final value).
 *
 * The Modifiers accordion shows:
 *   - Base Score: baseSubscoreValue
 *   - Elective Modifier: always 0 (placeholder for a future feature)
 *   - Path Modifier: pathModifierTotal (colored green/red based on sign)
 *   - Gear Modifier: gearModifierTotal (colored green/red based on sign)
 *
 * Increment/decrement constraints:
 *   - Capped at 100 (max subscore value).
 *   - Cannot go below 0.
 *   - Incrementing requires `availablePoints > 0` (the shared point budget).
 *   - Each click dispatches `setSubscore()` to update Redux and `setScorePoints()`
 *     to adjust the shared budget.
 *
 * The component uses `select-none` to prevent accidental text selection when
 * clicking the +/– buttons rapidly.
 *
 * Props:
 *   - subscore: display name of the subscore
 *   - value: initial value from Redux (or null if not yet set)
 *   - subscore_id: Redux ID for this subscore
 *   - parent_id: Redux ID of the parent score category (needed for setSubscore)
 *   - pathModifiers: Modifier[] — path modifiers applying to this specific subscore
 *   - gearModifiers: Modifier[] — gear modifiers applying to this specific subscore
 *   - availablePoints: remaining point budget (from Redux scorePoints)
 *
 * Used by:
 *   - Score.tsx (one SubScore per entry in score.subscores array)
 */
'use client';
import clsx from 'clsx';
import { Accordion } from "@heroui/react";
import Icon from '@mdi/react';
import { mdiPlus, mdiMinus } from '@mdi/js';
import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/lib/hooks'
import { setSubscore, setScorePoints } from "@/lib/slices/characterSlice";

interface Modifier {
	_id: string,
	parent_id: string,
	value: number | null
};

const SubScore = ({
		subscore,
		value,
		subscore_id,
		parent_id,
		pathModifiers,
		gearModifiers,
		availablePoints = 0
	}: {
		subscore: string | null,
		value: number | null,
		subscore_id: string,
		parent_id: string,
		pathModifiers: Modifier[],
		gearModifiers: Modifier[],
		availablePoints: number
	}) => {

	const dispatch = useAppDispatch();
	const [baseSubscoreValue, setBaseSubscoreValue] = useState(0);
	const [calcSubscoreValue, setCalcSubscoreValue] = useState(0);
	const [pathModifierTotal, setPathModifierTotal] = useState(0);
	const [gearModifierTotal, setGearModifierTotal] = useState(0);

	useEffect(() => {
		if(value !== null) {
			setBaseSubscoreValue(value);
		}
	},[value]);

	// useEffect(() => {
	// 	let curSubscoreValue = baseSubscoreValue + pathModifier + gearModifier;
	// 	setCalcSubscoreValue(curSubscoreValue);
	// },[pathModifier, gearModifier, baseSubscoreValue]);

	useEffect(() => {
		let total = 0;
		pathModifiers.forEach( (m) => {
			m.value !== null ? total += m.value : undefined;
		});
		if(pathModifierTotal != total) {
			setPathModifierTotal(total);
		}
		//setPathModifierTotal(total);
	},[pathModifiers, pathModifierTotal]);

	useEffect(() => {
		let total = 0;
		gearModifiers.forEach( (m) => {
			m.value !== null ? total += m.value : undefined;
		});
		if(gearModifierTotal != total) {
			setGearModifierTotal(total);
		}
		//setGearModifierTotal(total);
	},[gearModifiers, gearModifierTotal]);

	useEffect(() => {
		let curSubscoreValue = baseSubscoreValue + pathModifierTotal + gearModifierTotal;
		setCalcSubscoreValue(curSubscoreValue);
	},[pathModifierTotal, gearModifierTotal, baseSubscoreValue]);

	const handlePlusClick = () => {
		if(calcSubscoreValue < 100 && availablePoints > 0) {
			//check if points available from prop
			let curBase = baseSubscoreValue;
			curBase++;
			setBaseSubscoreValue(curBase);
			// update in store
			dispatch(setSubscore( { _id: subscore_id, parent_id: parent_id, value: curBase } ));
			let subscorePoints = availablePoints - 1;
			dispatch(setScorePoints(subscorePoints));
		}
	};

	const handleMinusClick = () => {
		if(calcSubscoreValue > 0) {
			//check if points available from prop
			let curBase = baseSubscoreValue;
			curBase--;
			setBaseSubscoreValue(curBase);
			// update in store
			dispatch(setSubscore( { _id: subscore_id, parent_id: parent_id, value: curBase } ));
			let subscorePoints = availablePoints + 1;
			dispatch(setScorePoints(subscorePoints));
		}
	};

	return (
		<div className="mb-2 select-none">
			<div className="flex justify-between items-center">
				<span className="font-semibold">{subscore}</span>
				<div className="w-20 flex justify-between items-center">
					<div
						onClick={handleMinusClick}
						className="cursor-pointer">
						<Icon
							path={mdiMinus}
							size={0.75} />
					</div>
					{calcSubscoreValue}
					<div
						onClick={handlePlusClick}
						className="cursor-pointer">
						<Icon
							path={mdiPlus}
							size={0.75} />
					</div>
				</div>
			</div>
			<div className="pb-2 w-full text-sm">
				<Accordion className="border-0 outline-hidden pl-0 pr-0 w-full">
					<Accordion.Item>
						<Accordion.Heading className="bg-white pl-0 pr-0">
							<Accordion.Trigger className="border-0 pl-0 pr-0" aria-label={`${subscore}_modifiers`}>
								<span className="text-right text-sm notoserif">Modifiers</span>
								<Accordion.Indicator />
							</Accordion.Trigger>
						</Accordion.Heading>
						<Accordion.Panel>
							<Accordion.Body className="pl-0 pr-0">
								<div className="border-b text-sm flex justify-between">
									<span>Base Score</span>
									<span>{baseSubscoreValue}</span>
								</div>
								<div className="border-b text-sm flex justify-between">
									<span>Elective Modifier</span>
									<span>0</span>
								</div>
								<div className={clsx(
									"text-sm border-b flex justify-between",
									{
										"text-oxblood font-semibold" : pathModifierTotal < 0
									},
									{
										"text-laurel font-semibold" : pathModifierTotal > 0
									},
								)}>
									<span>Path Modifier</span>
									<span>
										{ pathModifierTotal > 0 ? "+" : "" }
										{pathModifierTotal}
									</span>
								</div>
								<div className={clsx(
									"text-sm flex justify-between",
									{
										"text-oxblood font-semibold" : gearModifierTotal < 0
									},
									{
										"text-laurel font-semibold" : gearModifierTotal > 0
									},
								)}>
									<span>Gear Modifier</span>
									<span>
										{ gearModifierTotal > 0 ? "+" : "" }
										{gearModifierTotal}
									</span>
								</div>
							</Accordion.Body>
						</Accordion.Panel>
					</Accordion.Item>
				</Accordion>
			</div>
		</div>
	);
};

export default SubScore;