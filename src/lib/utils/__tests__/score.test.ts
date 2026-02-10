import { calculateScoreAverage } from '@/lib/utils/score';

describe('calculateScoreAverage', () => {
	it('returns 0 for undefined input', () => {
		expect(calculateScoreAverage(undefined)).toBe(0);
	});

	it('returns 0 for empty array', () => {
		expect(calculateScoreAverage([])).toBe(0);
	});

	it('returns the value for a single subscore', () => {
		expect(calculateScoreAverage([{ value: 7 }])).toBe(7);
	});

	it('returns the rounded average of multiple subscores', () => {
		expect(calculateScoreAverage([{ value: 3 }, { value: 4 }])).toBe(4);
		expect(calculateScoreAverage([{ value: 10 }, { value: 5 }, { value: 3 }])).toBe(6);
	});

	it('treats null values as 0', () => {
		expect(calculateScoreAverage([{ value: null }, { value: 6 }])).toBe(3);
		expect(calculateScoreAverage([{ value: null }])).toBe(0);
	});
});
