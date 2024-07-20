import Input from '@/app/components/common/forms/Input';
import { PATHS } from '@/app/lib/global-data';
import { mdiFileCertificate, mdiScriptText, mdiHeadCog } from '@mdi/js';
import {Select, SelectSection, SelectItem} from "@nextui-org/select";

const ChoosePath = () => {

	let details = (<div></div>);

	const handleSelectChange = (event) => {
		console.log(event.target.value);
		if(event.target.value !== "") {
			details = (
				<div className="flex justify-around">
					<div>ICON</div>
					<div>
						<h3>TITLE</h3>
						<div>
							{event.target.value}
						</div>
					</div>
				</div>
			);
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