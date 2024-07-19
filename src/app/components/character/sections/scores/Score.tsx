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
		<div className="w-full mb-2">
			<h3 className="marcellus text-2xl border-b-2 border-solid mb-2">
				{score.name}
				<span className="float-right font-bold">50</span>
			</h3>
			{score.children.map((subscore) => (
				<div className="mb-2" key={subscore.name}>
					<span className="text-xl">{subscore.name}</span>
					<div className="text-xl w-24 float-right flex justify-between">
						<Icon className="my-auto" path={mdiMinus} size={0.75} />
						50
						<Icon className="my-auto" path={mdiPlus} size={0.75} />
					</div>
					<div className="pb-2 w-full text-sm">
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
										'transition-transform baseline ml-2 my-auto',
										{
											'rotate-90': rotated === true,
										})}
										path={mdiPlusCircleOutline}
										size={0.75} />

								}>
								<div className="border-b text-sm">
									Base Score
									<span className="float-right">50</span>
								</div>
								<div className="border-b text-sm">
									Elective Modifier
									<span className="float-right">0</span>
								</div>
								<div className="text-sm">
									Path Modifier
									<span className="float-right">0</span>
								</div>
							</AccordionItem>
						</Accordion>
					</div>
				</div>
			))}
			<div className="text-xl mt-2 mb-8">
				{score.elective.name}
				<div className="float-right flex justify-between w-24">
					<Icon className="my-auto" path={mdiMinus} size={0.75} />
					5
					<Icon className="my-auto" path={mdiPlus} size={0.75} />
				</div>
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