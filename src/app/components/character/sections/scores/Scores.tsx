import Score from '@/app/components/character/sections/scores/Score';
import { SCORES, PATHS } from '@/app/lib/global-data';

// hardcode path for now until store is built
let allScores = SCORES;
const curPath = PATHS.find((path) => path.value === "theurgist");
const values: Record<string, number> = {};

if(curPath){
	curPath.modifiers.forEach((score) =>  {
		score.modifier.forEach((m) => {
			let thisSubscore = allScores[score.id as keyof allScores].children;
			let foundIndex:keyof typeof thisSubscore = thisSubscore.findIndex(x => x.id == m.id);
			allScores[score.id].children[foundIndex].value = m.value;
		});
	});
}

const Scores = () => {
	return (
		<div className="grid grid-cols-2">
			<div className="flex justify-end pt-16 pb-16">
				<div className="max-w-[673px] w-full pr-16">
					<Score score={allScores.physical} />
					<Score score={allScores.interpersonal} />
				</div>
			</div>
			<div className="bg-black text-white pt-16 pb-16">
				<div className="max-w-[673px] w-full pl-16">
					<Score score={allScores.intellect} />
					<Score score={allScores.psyche} />
				</div>
			</div>
		</div>
	);
};

export default Scores;