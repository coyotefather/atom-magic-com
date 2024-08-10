'use client';
import clsx from 'clsx';
import {Accordion, AccordionItem} from "@nextui-org/accordion";
import Icon from '@mdi/react';
import { mdiPlus, mdiMinus, mdiChevronLeftCircle } from '@mdi/js';

const SubScore = ({
		subscore,
		value = 0
	}: {
		subscore: string,
		value: number
	}) => {
	return (
		<div className="mb-2">
			<span className="font-semibold">{subscore}</span>
			<div className="w-20 float-right flex justify-between">
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
							<span className="float-right">50</span>
						</div>
						<div className="border-b text-sm">
							Elective Modifier
							<span className="float-right">0</span>
						</div>
						<div className={clsx(
							"text-sm",
							{
								"text-adobe font-semibold" : value < 0
							},
							{
								"text-dark-olive-green font-semibold" : value > 0
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