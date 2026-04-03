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