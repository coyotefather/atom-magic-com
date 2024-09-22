'use client';
import clsx from 'clsx';
import {Accordion, AccordionItem} from "@nextui-org/accordion";
import Icon from '@mdi/react';
import { mdiPlus, mdiMinus, mdiChevronLeftCircle } from '@mdi/js';
import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/lib/hooks'
import { setSubscore, setScorePoints } from "@/lib/slices/characterSlice";

const SubScore = ({
		subscore,
		subscore_id,
		parent_id,
		pathModifier = 0,
		gearModifier = 0,
		availablePoints = 0
	}: {
		subscore: string | null,
		subscore_id: string,
		parent_id: string,
		pathModifier: number,
		gearModifier: number,
		availablePoints: number
	}) => {

	const dispatch = useAppDispatch();
	const [baseSubscoreValue, setBaseSubscoreValue] = useState(50);
	const [calcSubscoreValue, setCalcSubscoreValue] = useState(50);
	useEffect(() => {
		let curSubscoreValue = baseSubscoreValue + pathModifier + gearModifier;
		setCalcSubscoreValue(curSubscoreValue);
	},[pathModifier, gearModifier, baseSubscoreValue]);

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
							title: `text-right text-sm`,
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
								"text-adobe font-semibold" : pathModifier < 0
							},
							{
								"text-dark-olive-green font-semibold" : pathModifier > 0
							},
						)}>
							Path Modifier
							<span className="float-right">
								{ pathModifier > 0 ? "+" : "" }
								{pathModifier}
							</span>
						</div>
						<div className={clsx(
							"text-sm",
							{
								"text-adobe font-semibold" : gearModifier < 0
							},
							{
								"text-dark-olive-green font-semibold" : gearModifier > 0
							},
						)}>
							Gear Modifier
							<span className="float-right">
								{ gearModifier > 0 ? "+" : "" }
								{gearModifier}
							</span>
						</div>
					</AccordionItem>
				</Accordion>
			</div>
		</div>
	);
};

export default SubScore;