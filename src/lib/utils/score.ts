/**
 * Calculate the average of subscores, rounding to nearest integer.
 * Handles null values by treating them as 0.
 */
export function calculateScoreAverage(
	subscores: { value: number | null }[] | undefined
): number {
	if (!subscores || subscores.length === 0) return 0;
	const total = subscores.reduce((sum, sub) => sum + (sub.value || 0), 0);
	return Math.round(total / subscores.length);
}
