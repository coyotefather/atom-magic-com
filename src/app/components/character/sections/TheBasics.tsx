import Input from '@/app/components/common/forms/Input';
import Select from '@/app/components/common/forms/Select';
import { CULTURES } from '@/app/lib/global-data';

const TheBasics = () => {
	return (
		<div>
			<p>
				Enter and choose some basic information about your character. Note that none of the choices here affect scores. These are purely for roleplaying purposes.
			</p>
			<p>
				  For more information on cultures, see <a href="https://atom-magic.com/codex/cultures" title="Cultures on Solum">Cultures on Solum</a>.
			</p>
			<div className="flex justify-between mt-4">
				<Input name="Name" type="text" widthClass="w-96" required={true} />
				<Input name="Age" type="number" widthClass="w-24" required={true} />
				<Input name="Pronouns" type="text" widthClass="w-96" required={false} />
				<Select
					name="Culture"
					widthClass="w-96"
					required={true}
					options={CULTURES} />
			</div>
		</div>
	);
};

export default TheBasics;