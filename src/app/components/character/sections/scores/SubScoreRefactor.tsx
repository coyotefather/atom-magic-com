'use client';
import clsx from 'clsx';
import {Accordion, AccordionItem} from "@nextui-org/accordion";
import Icon from '@mdi/react';
import { mdiPlus, mdiMinus, mdiChevronLeftCircle } from '@mdi/js';
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
	},[]);

	// useEffect(() => {
	// 	let curSubscoreValue = baseSubscoreValue + pathModifier + gearModifier;
	// 	setCalcSubscoreValue(curSubscoreValue);
	// },[pathModifier, gearModifier, baseSubscoreValue]);

	useEffect(() => {
		let total = 0;
		pathModifiers.forEach( (m) => {
			m.value !== null ? total += m.value : undefined;
		});
		setPathModifierTotal(total);
	},[pathModifiers]);

	useEffect(() => {
		let total = 0;
		gearModifiers.forEach( (m) => {
			m.value !== null ? total += m.value : undefined;
		});
		setGearModifierTotal(total);
	},[gearModifiers]);

	useEffect(() => {
		let curSubscoreValue = baseSubscoreValue + pathModifierTotal;
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
			<span className="font-semibold">{subscore}</span>
			<div className="w-20 float-right flex justify-between">
				<div
					onClick={handleMinusClick}
					className="my-auto cursor-pointer">
					<Icon
						path={mdiMinus}
						size={0.75} />
				</div>
				{calcSubscoreValue}
				<div
					onClick={handlePlusClick}
					className="my-auto cursor-pointer">
					<Icon
						path={mdiPlus}
						size={0.75} />
				</div>
			</div>
			<div className="pb-2 w-full text-sm">
				<Accordion
					isCompact
					className="border-0 focus:border-0 outline-none focus:outline-none pl-0 pr-0"
					itemClasses={
						{
							base: 'pl-0 pr-0',
							title: `text-right text-sm notoserif`,
							trigger: 'border-0',
							indicator: "",
						}
					}
					fullWidth>
					<AccordionItem
						key={`${subscore}_modifiers`}
						aria-label={`${subscore}_modifiers`}
						indicator={<Icon path={mdiChevronLeftCircle} size={0.75} />}
						title="Modifiers">
						<div className="border-b text-sm">
							Base Score
							<span className="float-right">{baseSubscoreValue}</span>
						</div>
						<div className="border-b text-sm">
							Elective Modifier
							<span className="float-right">0</span>
						</div>
						<div className={clsx(
							"text-sm border-b",
							{
								"text-adobe font-semibold" : pathModifierTotal < 0
							},
							{
								"text-dark-olive-green font-semibold" : pathModifierTotal > 0
							},
						)}>
							Path Modifier
							<span className="float-right">
								{ pathModifierTotal > 0 ? "+" : "" }
								{pathModifierTotal}
							</span>
						</div>
						<div className={clsx(
							"text-sm",
							{
								"text-adobe font-semibold" : gearModifierTotal < 0
							},
							{
								"text-dark-olive-green font-semibold" : gearModifierTotal > 0
							},
						)}>
							Gear Modifier
							<span className="float-right">
								{ gearModifierTotal > 0 ? "+" : "" }
								{gearModifierTotal}
							</span>
						</div>
					</AccordionItem>
				</Accordion>
			</div>
		</div>
	);
};

export default SubScore;