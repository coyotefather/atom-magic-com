import Score from '@/app/components/character/sections/scores/Score';
import { SCORES } from '@/app/lib/global-data';

const Scores = () => {
	return (
		<div>
			<p className="pb-2">
				Each category of scores below has its own pool of points as indicated by the available points listed beneath each. If you subtract from one score, you&apos;ll see you have more points available to add to another in that category.
			</p>
			<p className="pb-2">
				Also note that one score is separated below the others. This is the elective score for the elective and has a score on a scale of 1 to 10. Increasing or decreasing the score will add bonuses or demerits to other scores in the category.
			</p>
			<p className="pb-4">
				For more information on scoring, see <a href="https://atom-magic.com/codex/Scores" target="_new">Character scores</a>.
			</p>
			<div className="grid grid-cols-2 gap-16">
				<Score score={SCORES.physical} />
				<Score score={SCORES.interpersonal} />
				<Score score={SCORES.intellect} />
				<Score score={SCORES.psyche} />
			</div>
		</div>
	);
};

export default Scores;