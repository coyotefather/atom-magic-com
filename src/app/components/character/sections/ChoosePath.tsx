import Input from '@/app/components/common/forms/Input';
import { PATHS } from '@/app/lib/global-data';
import Icon from '@mdi/react';
import { mdiFileCertificate, mdiScriptText, mdiHeadCog } from '@mdi/js';
import {Select, SelectSection, SelectItem} from "@nextui-org/select";
import { useState } from 'react';

const icons = {
	"mdiFileCertificate": {mdiFileCertificate},
	"mdiScriptText": {mdiScriptText},
	"mdiHeadCog": {mdiHeadCog},
};

const ChoosePath = () => {

	const [details, setDetails] = useState(<div></div>);

	const handleSelectChange = (event) => {
		if(event.target.value !== "") {
			let path = PATHS.find((path) => path.value === event.target.value);
			if(path != undefined) {
				setDetails(
					<div className="flex justify-around max-w-[800px] mx-auto my-8 transition-all duration-200 ease-linear">
						<div className="m-2">
							<Icon
								path={icons[path.icon][path.icon]}
								className="inline ml-2"
								size={3}
								horizontal
								vertical />
						</div>
						<div className="m-2">
							<h3 className="text-2xl border-b-2 mb-2">{path.name}</h3>
							<div>
								{path.description}
							</div>
						</div>
					</div>
				);
			}
		}
	};

	return (
		<div>
			<div className="grid grid-cols-2 gap-4">
				<div>
					<p className="pb-2">
						Paths indicate how your character came to be skilled in the arts of atom magic. While many techniques are common to all three, some are specific to each path.
					</p>
					<p>
						For more information, see <a href="https://atom-magic.com/codex/cPaths" title="Paths">Character paths</a>.
					</p>
				</div>
				<div className="m-auto">
					<Select
						isRequired
						variant="bordered"
						radius="sm"
						label="Path"
						placeholder="Select a Path"
						className="w-96"
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
			{details}
		</div>
	);
};

export default ChoosePath;