'use client';
import clsx from 'clsx';
import {Accordion, AccordionItem} from "@nextui-org/accordion";
import Icon from '@mdi/react';
import { mdiPlus, mdiMinus, mdiChevronLeftCircle } from '@mdi/js';
import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/lib/hooks'
import { setGear } from "@/app/lib/slices/characterSlice";

const SubScore = ({
		subscore,
		pathModifier = 0,
		gearModifier = 0
	}: {
		subscore: string,
		pathModifier: number,
		gearModifier: number
	}) => {


	const [baseSubscoreValue, setBaseSubscoreValue] = useState(50);
	const [calcSubscoreValue, setCalcSubscoreValue] = useState(50);
	useEffect(() => {
		let curSubscoreValue = baseSubscoreValue + pathModifier + gearModifier;
		setCalcSubscoreValue(curSubscoreValue);
	},[pathModifier, gearModifier, baseSubscoreValue]);

	const handlePlusClick = () => {
		if(calcSubscoreValue < 100) {
			let curBase = baseSubscoreValue;
			curBase++;
			setBaseSubscoreValue(curBase);
		}
	};

	const handleMinusClick = () => {
		if(calcSubscoreValue > 0) {
			let curBase = baseSubscoreValue;
			curBase--;
			setBaseSubscoreValue(curBase);
		}
	};

	return (
		<div className="mb-2">
			<span className="font-semibold">{subscore}</span>
			<div className="w-20 float-right flex justify-between">
				<Icon
					onClick={handleMinusClick}
					className="my-auto cursor-pointer"
					path={mdiMinus}
					size={0.75} />
				{calcSubscoreValue}
				<Icon
					onClick={handlePlusClick}
					className="my-auto cursor-pointer"
					path={mdiPlus}
					size={0.75} />
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