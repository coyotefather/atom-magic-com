'use client';
import {Input} from "@nextui-org/input";
import {Select, SelectSection, SelectItem} from "@nextui-org/select";
import { CULTURES } from '@/app/lib/global-data';

const TheBasics = () => {
	return (
		<div>
			<p className="pb-2">
				Enter and choose some basic information about your character. Note that none of the choices here affect scores. These are purely for roleplaying purposes.
			</p>
			<p>
				  For more information on cultures, see <a href="https://atom-magic.com/codex/cultures" title="Cultures on Solum">Cultures on Solum</a>.
			</p>
			<div className="flex justify-between mt-4">
				<Input
					isRequired
					type="text"
					label="Name"
					className="w-96"
					placeholder="Enter Character Name" />
				<Input
					isRequired
					type="number"
					label="Age"
					className="w-24"
					placeholder="Enter Age" />
				<Input
					isRequired
					type="text"
					label="Pronouns"
					className="w-96"
					placeholder="Enter Character Pronouns" />
				<Select
					isRequired
					variant="bordered"
					radius="sm"
					label="Culture"
					placeholder="Select a Culture"
					className="w-96"
				  >
					{CULTURES.map((culture) => (
					  <SelectItem key={culture.value}>
						{culture.name}
					  </SelectItem>
					))}
				</Select>
			</div>
		</div>
	);
};

export default TheBasics;