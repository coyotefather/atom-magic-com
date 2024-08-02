import Score from '@/app/components/character/sections/scores/Score';
import { SCORES } from '@/app/lib/global-data';

const Scores = () => {
	return (
		<div className="grid grid-cols-2">
			<div className="flex justify-end pt-16 pb-16">
				<div className="max-w-[673px] w-full pr-16">
					<Score score={SCORES.physical} />
					<Score score={SCORES.interpersonal} />
				</div>
			</div>
			<div className="bg-black text-white pt-16 pb-16">
				<div className="max-w-[673px] w-full pl-16">
					<Score score={SCORES.intellect} />
					<Score score={SCORES.psyche} />
				</div>
			</div>
		</div>
	);
};

export default Scores;