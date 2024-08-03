import Score from '@/app/components/character/sections/scores/Score';
import { SCORES, PATHS } from '@/app/lib/global-data';

// hardcode path for now until store is built
const curPath = PATHS.find((path) => path.value === "theurgist");
const allScores = SCORES;
let modifiersMap = new Map<string, number>([]);

if(curPath){
	curPath.modifiers.forEach((score) =>  {
		score.modifier.forEach((m) => {
			modifiersMap.set(m.id, m.value);
		});
	});
}

const Scores = () => {
	return (
		<div className="grid grid-cols-2">
			<div className="flex justify-end pt-16 pb-16">
				<div className="max-w-[673px] w-full pr-16">
					<Score score={SCORES.physical} modifiers={modifiersMap} />
					<Score score={SCORES.interpersonal} modifiers={modifiersMap} />
				</div>
			</div>
			<div className="bg-black text-white pt-16 pb-16">
				<div className="max-w-[673px] w-full pl-16">
					<Score score={SCORES.intellect} modifiers={modifiersMap} />
					<Score score={SCORES.psyche} modifiers={modifiersMap} />
				</div>
			</div>
		</div>
	);
};

export default Scores;