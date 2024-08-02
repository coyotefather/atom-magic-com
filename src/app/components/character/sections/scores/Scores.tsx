import Score from '@/app/components/character/sections/scores/Score';
import { SCORES, PATHS } from '@/app/lib/global-data';

// hardcode path for now until store is built
const curPath = PATHS.find((path) => path.value === "theurgist");
let values: { [key: string]: number } = {};
if(curPath) {
	curPath.modifiers.forEach( (score) => {
		score.modifier.forEach( (m) => {
			values[m.name] = m.value;
		} );
	} );
}

const Scores = () => {
	return (
		<div className="grid grid-cols-2">
			<div className="flex justify-end pt-16 pb-16">
				<div className="max-w-[673px] w-full pr-16">
					<Score score={SCORES.physical} values={values} />
					<Score score={SCORES.interpersonal} values={values} />
				</div>
			</div>
			<div className="bg-black text-white pt-16 pb-16">
				<div className="max-w-[673px] w-full pl-16">
					<Score score={SCORES.intellect} values={values} />
					<Score score={SCORES.psyche} values={values} />
				</div>
			</div>
		</div>
	);
};

export default Scores;