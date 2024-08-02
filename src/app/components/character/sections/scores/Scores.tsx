import Score from '@/app/components/character/sections/scores/Score';
import { SCORES, PATHS } from '@/app/lib/global-data';

// hardcode path for now until store is built
const curPath = PATHS.find((path) => path.value === "theurgist");

const Scores = () => {
	return (
		<div className="grid grid-cols-2">
			<div className="flex justify-end pt-16 pb-16">
				<div className="max-w-[673px] w-full pr-16">
					<Score score={SCORES.physical} path={curPath} />
					<Score score={SCORES.interpersonal} path={curPath} />
				</div>
			</div>
			<div className="bg-black text-white pt-16 pb-16">
				<div className="max-w-[673px] w-full pl-16">
					<Score score={SCORES.intellect} path={curPath} />
					<Score score={SCORES.psyche} path={curPath} />
				</div>
			</div>
		</div>
	);
};

export default Scores;