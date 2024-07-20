import Input from '@/app/components/common/forms/Input';
import Select from '@/app/components/common/forms/Select';
import { PATHS } from '@/app/lib/global-data';

const ChoosePath = () => {
	return (
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
					name="Path"
					widthClass="w-96"
					required={true}
					options={PATHS} />
			</div>
		</div>
	);
};

export default ChoosePath;