/**
 * score.ts
 *
 * Utility for calculating a character's core score value from its subscores.
 *
 * In the Atom Magic system, each of the four core scores (Physical, Interpersonal,
 * Intellect, Psyche) is made up of several subscores. For example, "Physical"
 * might include subscores like Strength, Agility, and Endurance.
 *
 * The overall score value is the average of its subscores, rounded to the
 * nearest integer. This average is used throughout the Character Manager:
 *   - As the character's displayed score on the character sheet
 *   - As the base value for derived stats (e.g., Physical score → base Physical Shield)
 *   - For Vorago board game stat comparisons
 *
 * Subscores are set individually by the user in the Character Manager's
 * "Adjust Scores" section. They can be null if not yet assigned (which is
 * treated as 0 in the average calculation).
 *
 * Used by:
 *   - src/lib/slices/characterSlice.ts (setScoreValue reducer, recomputes after each change)
 *   - src/app/components/character/sections/scores/AdditionalScores.tsx (display)
 */

/**
 * Calculates the average of a set of subscores, rounding to the nearest integer.
 *
 * @param subscores - An array of subscore objects, each with a `value` (number
 *   or null). Null values are treated as 0. If the array is undefined or empty,
 *   returns 0.
 *
 * @returns The rounded average of all subscore values, or 0 if no subscores.
 *
 * @example
 *   calculateScoreAverage([{ value: 8 }, { value: 12 }, { value: null }])
 *   // → Math.round((8 + 12 + 0) / 3) = Math.round(6.67) = 7
 */
export function calculateScoreAverage(
	subscores: { value: number | null }[] | undefined
): number {
	if (!subscores || subscores.length === 0) return 0;
	const total = subscores.reduce((sum, sub) => sum + (sub.value || 0), 0);
	return Math.round(total / subscores.length);
}
