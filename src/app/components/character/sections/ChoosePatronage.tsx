'use client';
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import { CARDINALS } from '@/app/lib/global-data';
import {Select, SelectSection, SelectItem} from "@nextui-org/select";
import { useState, useRef } from 'react';
import { CSSTransition, SwitchTransition } from "react-transition-group";

const ChoosePatronage = () => {
	const detailsRef = useRef(null);

	const [details, setDetails] = useState(
		<SelectDetailExpanded
			imagePath=""
			name="Choose a Patron"
			description="Select an option from the dropdown."
			disabled={true} />
	);
	const [detailsUpdated, setDetailsUpdated] = useState(false);

	const handleSelectChange = (event: React.ChangeEvent) => {
		let val = (event.target as HTMLInputElement).value;
		if(val !== "") {
			setDetailsUpdated(detailsUpdated => !detailsUpdated);
			let cardinal = CARDINALS.find((cardinal) => cardinal.value === val);
			if(cardinal != undefined) {
				setDetails(
					<SelectDetailExpanded
						imagePath={cardinal.svgSrc}
						name={cardinal.name}
						description={cardinal.description}
						disabled={false} />
				);
			}
		}
	};

	return (
		<div>
			<div className="grid grid-cols-2 gap-4">
				<div>
					<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">Choose a Patron</h2>
					<p className="pb-2">
						Optionally choose a patronage from a Cardinal. This doesn&apos;t directly affect your base or calculated scores but can affect actions you take.
					</p>
					<p>
						For more information, see <a href="https://atom-magic.com/codex/Cardinal_Forces" title="Paths">Cardinal Forces</a>.
					</p>
					<div className="m-auto">
						<Select
							isRequired
							variant="bordered"
							radius="sm"
							label="Path"
							placeholder="Select a Path"
							className="w-96 mt-8"
							onChange={(event) => handleSelectChange(event)}
						  >
							{CARDINALS.map((cardinal) => (
							  <SelectItem key={cardinal.value}>
								{cardinal.name}
							  </SelectItem>
							))}
						</Select>
					</div>
				</div>
				<SwitchTransition mode="out-in">
					<CSSTransition
					   key={detailsUpdated ? "x" : "y"}
					   nodeRef={detailsRef}
					   timeout={300}
					   classNames='fade'
					 >
					 	<div ref={detailsRef}>
						 	{details}
					 	</div>
					</CSSTransition>
				</SwitchTransition>
			</div>
		</div>
	);
};

export default ChoosePatronage;