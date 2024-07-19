'use client';
import { useState } from 'react';
import clsx from 'clsx';
import {Accordion, AccordionItem} from "@nextui-org/accordion";
import Icon from '@mdi/react';
import { mdiPlusCircleOutline, mdiPlus, mdiMinus } from '@mdi/js';

const Score = ({
		score,
	}: {
		score: {
			name: string,
			children: {
				name: string,
				value: string
			}[],
			elective: {
				name: string,
				value: string
			}
		},
	}) => {
	const [rotated, setRotated] = useState(false);
	const rotate = () => {
		rotated ? setRotated(false) : setRotated(true);
	};
	return (
		<div className="w-full mb-4">
			<h3 className="marcellus text-2xl border-b-2 border-solid mb-4">
				{score.name}
				<span className="float-right font-bold">50</span>
			</h3>
			{score.children.map((subscore) => (
				<div className="mb-4" key={subscore.name}>
					<span className="text-xl">{subscore.name}</span>
					<div className="text-xl float-right">
						<Icon className="inline" path={mdiMinus} size={0.75} />
						50
						<Icon className="inline" path={mdiPlus} size={0.75} />
					</div>
					<div className="w-full">
						<Accordion
							className="border-0 focus:border-0 outline-none focus:outline-none"
							isCompact
							fullWidth
							onSelectionChange={ () => rotate() }>
							<AccordionItem
								key={`${subscore.name}_modifiers`}
								aria-label={`${subscore.name}_modifiers`}
								title="Modifiers"
								indicator={
									<Icon
										className={clsx(
										'transition-transform ml-2',
										{
											'rotate-90': rotated === true,
										})}
										path={mdiPlusCircleOutline}
										size={1} />

								}>
								<div className="border-b">
									some modifiers
									<span className="float-right">+0</span>
								</div>
								<div className="border-b">
									some modifiers
									<span className="float-right">+0</span>
								</div>
								<div className="">
									some modifiers
									<span className="float-right">+0</span>
								</div>
							</AccordionItem>
						</Accordion>
					</div>
				</div>
			))}
			<div className="mt-2 mb-8">
				{score.elective.name}
				<span className="float-right">5</span>
			</div>
			<div className="text-sm text-right">
				<div>
					{score.name} points available: 0/200
				</div>
				<div>
				Elective points available: 0/20
				</div>
			</div>
		</div>
	);
};

export default Score;