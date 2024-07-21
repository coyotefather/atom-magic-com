'use client';
import SelectDetail from '@/app/components/common/SelectDetail';
import { PATHS } from '@/app/lib/global-data';
import { mdiBookshelf, mdiScriptText, mdiHeadCog, mdiAtom } from '@mdi/js';
import {Select, SelectSection, SelectItem} from "@nextui-org/select";
import { useState, useRef } from 'react';
import { CSSTransition, SwitchTransition } from "react-transition-group";

const icons = {
	"mdiBookshelf": {mdiBookshelf},
	"mdiScriptText": {mdiScriptText},
	"mdiHeadCog": {mdiHeadCog},
};

const ChoosePath = () => {
	const detailsRef = useRef(null);

	const [details, setDetails] = useState(
		<SelectDetail
			iconPath={mdiAtom}
			name="Choose a Path"
			description="Select an option from the dropdown."
			disabled={true} />
	);
	const [detailsUpdated, setDetailsUpdated] = useState(false);

	const handleSelectChange = (event) => {
		if(event.target.value !== "") {
			setDetailsUpdated(detailsUpdated => !detailsUpdated);
			let path = PATHS.find((path) => path.value === event.target.value);
			if(path != undefined) {
				setDetails(
					<SelectDetail
						iconPath={icons[path.icon][path.icon]}
						name={path.name}
						description={path.description}
						disabled={false} />
				);
			}
		}
	};

	return (
		<div>
			<div className="grid grid-cols-2 gap-4">
				<div>
					<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">Choose a Path</h2>
					<p className="pb-2">
						Paths indicate how your character came to be skilled in the arts of atom magic. While many techniques are common to all three, some are specific to each path.
					</p>
					<p>
						For more information, see <a href="https://atom-magic.com/codex/cPaths" title="Paths">Character paths</a>.
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
							{PATHS.map((path) => (
							  <SelectItem key={path.value}>
								{path.name}
							  </SelectItem>
							))}
						</Select>
					</div>
				</div>
				<div>
					<div className="transition-all duration-200 ease-linear">
						<SwitchTransition mode="out-in">
							<CSSTransition
							   key={detailsUpdated}
							   nodeRef={detailsRef}
							   addEndListener={(done) => {
								 detailsRef.current.addEventListener("transitionend", done, false);
							   }}
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
			</div>
		</div>
	);
};

export default ChoosePath;