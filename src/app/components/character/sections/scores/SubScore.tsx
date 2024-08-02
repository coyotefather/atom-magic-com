'use client';
import clsx from 'clsx';
import {Accordion, AccordionItem} from "@nextui-org/accordion";
import Icon from '@mdi/react';
import { mdiPlus, mdiMinus } from '@mdi/js';

const SubScore = ({
		subscore,
		value = 0
	}: {
		subscore: string,
		value: number
	}) => {

	// {
	// 	curModifiers.modifier.find((m) => m.name === subscore.name).value
	// }

	return (
		<div className="mb-2" key={subscore.name}>
			<span className="text-xl">{subscore.name}</span>
			<div className="text-xl w-24 float-right flex justify-between">
				<Icon className="my-auto" path={mdiMinus} size={0.75} />
				50
				<Icon className="my-auto" path={mdiPlus} size={0.75} />
			</div>
			<div className="pb-2 w-full text-sm">
				<Accordion
					isCompact
					className="border-0 focus:border-0 outline-none focus:outline-none pl-0 pr-0"
					itemClasses={
						{
							base: 'pl-0 pr-0',
							title: `text-gold text-right`,
							indicator: "text-gold",
						}
					}
					fullWidth>
					<AccordionItem
						key={`${subscore.name}_modifiers`}
						aria-label={`${subscore.name}_modifiers`}
						title="Modifiers">
						<div className="border-b text-sm">
							Base Score
							<span className="float-right">50</span>
						</div>
						<div className="border-b text-sm">
							Elective Modifier
							<span className="float-right">0</span>
						</div>
						<div className={clsx(
							"text-sm",
							{
								"text-adobe" : value < 0
							},
							{
								"text-dark-olive-green" : value > 0
							},
						)}>
							Path Modifier
							<span className="float-right">
								{ value > 0 ? "+" : "" }
								{value}
							</span>
						</div>
					</AccordionItem>
				</Accordion>
			</div>
		</div>
	);
};

export default SubScore;