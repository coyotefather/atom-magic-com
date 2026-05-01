/**
 * AdjustScores.tsx
 *
 * A purely informational section that appears at the top of the scores area to
 * explain the scoring system before the player interacts with the actual score
 * controls. It contains no interactive elements and manages no state.
 *
 * The text explains:
 *   - Each of the four score categories has its own pool of points.
 *   - Points can be redistributed within a category (subtract from one subscore,
 *     gain points to add to another in that same category).
 *   - One score (the elective) is on a 1–10 scale and has cascading effects.
 *   - A link to the Codex article on scoring is provided for further reading.
 *
 * This section uses the dark variant Section wrapper (`variant="dark"`) in
 * Sections.tsx, making it appear with a dark background to visually separate the
 * scores area from the selection sections above and below.
 *
 * Used by:
 *   - Sections.tsx (first of the three score-related sections, rendered when
 *     `showAdjustScoresAndScores` becomes true)
 */
import ExternalLink from '@/app/components/common/ExternalLink';

const AdjustScores = () => {
	return (
		<div className="pt-16 pb-16 container">
			<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">Adjust Scores</h2>
			<p className="pb-2">
				Each category of scores below has its own pool of points as indicated by the available points listed beneath each. If you subtract from one score, you&apos;ll see you have more points available to add to another in that category.
			</p>
			<p className="pb-2">
				Also note that one score is separated below the others. This is the elective score for the elective and has a score on a scale of 1 to 10. Increasing or decreasing the score will add bonuses or demerits to other scores in the category.
			</p>
			<p className="pb-4">
				For more information on scoring, see <ExternalLink href="https://atom-magic.com/codex/Scores"
				name="Character scores" />.
			</p>
		</div>
	);
};

export default AdjustScores;