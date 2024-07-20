import Input from '@/app/components/common/forms/Input';
import Select from '@/app/components/common/forms/Select';
import { CULTURES } from '@/app/lib/global-data';

const ChoosePath = () => {
	return (
		<div className="grid grid-cols-2 gap-4">
			<div>
				<p>
					Paths indicate how your character came to be skilled in the arts of atom magic. While many techniques are common to all three, some are specific to each path.
				</p>
				<p>
					For more information, see <a href="https://atom-magic.com/codex/cPaths" title="Paths"Character paths</a>.
				</p>
			</div>
			<div className="align-middle">
				<Select
					name="Path"
					widthClass="w-96"
					required={true}
					options={CULTURES} />
			</div>
		</div>
	);
};

export default ChoosePath;