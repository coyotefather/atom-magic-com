import Score from '@/app/components/character/sections/scores/Score';
import { SCORES, PATHS } from '@/app/lib/global-data';

// hardcode path for now until store is built
const curPath = PATHS.find((path) => path.value === "theurgist");

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
		<div className="grid grid-cols-2 divide-x-2 bg-white container">
			<div className="pt-16 pb-16">
				<div className="grid 2xl:grid-cols-2 xl:grid-cols-1 gap-8 pr-4">
					<Score score={SCORES.physical} modifiers={modifiersMap} />
					<Score score={SCORES.interpersonal} modifiers={modifiersMap} />
				</div>
			</div>
			<div className="pt-16 pb-16">
				<div className="grid 2xl:grid-cols-2 xl:grid-cols-1 gap-8 pl-4">
					<Score score={SCORES.intellect} modifiers={modifiersMap} />
					<Score score={SCORES.psyche} modifiers={modifiersMap} />
				</div>
			</div>
		</div>
	);
};

export default Scores;