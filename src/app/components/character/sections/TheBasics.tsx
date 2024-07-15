import Input from '@/app/components/common/forms/Input';

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

				<label className="block">
					<span className="block text-sm font-medium text-slate-700">Culture</span>
					<select name="Culture" className="peer form-select w-96 rounded-md border-2 focus:ring-gold focus:border-gold">
						<option>Spiranos</option>
						<option>Boreanos</option>
						<option>Feranos</option>
						<option>Umbra</option>
						<option>Autogena</option>
					</select>
					<p className="mt-2 invisible peer-invalid:visible text-pink-600 text-sm">
						Please select a culture.
					</p>
				</label>
			</div>
		</div>
	);
};

export default TheBasics;