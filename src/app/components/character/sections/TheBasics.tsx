import Input from '@/app/components/common/forms/Input';
import Select from '@/app/components/common/forms/Select';

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
				<Input name="Name" type="text" width="96" required={true} />
				<Input name="Age" type="number" width="24" required={true} />
				<Input name="Pronouns" type="text" width="96" required={false} />
				<Select
					name="Culture"
					width="96"
					required={true}
					options={[
						{ name: "Spiranos", value: "0" },
						{ name: "Boreanos", value: "1" },
						{ name: "Feranos", value: "2" },
						{ name: "Umbra", value: "3" },
						{ name: "Autogena", value: "4" },
					]} />
			</div>
		</div>
	);
};

export default TheBasics;