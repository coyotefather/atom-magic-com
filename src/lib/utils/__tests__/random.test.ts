import { selectRandomElement, selectRandomElementOr, randomBoolean, randomDirection } from '@/lib/utils/random';

describe('selectRandomElement', () => {
	it('returns undefined for an empty array', () => {
		expect(selectRandomElement([])).toBeUndefined();
	});

	it('returns the only element from a single-element array', () => {
		expect(selectRandomElement([42])).toBe(42);
	});

	it('returns an element that exists in the array', () => {
		const items = ['a', 'b', 'c'];
		const result = selectRandomElement(items);
		expect(items).toContain(result);
	});
});

describe('selectRandomElementOr', () => {
	it('returns the fallback for an empty array', () => {
		expect(selectRandomElementOr([], 'fallback')).toBe('fallback');
	});

	it('returns an element from a non-empty array', () => {
		const items = [1, 2, 3];
		const result = selectRandomElementOr(items, 99);
		expect(items).toContain(result);
	});
});

describe('randomBoolean', () => {
	it('returns a boolean', () => {
		expect(typeof randomBoolean()).toBe('boolean');
	});

	it('produces both true and false over many runs', () => {
		const results = new Set(Array.from({ length: 100 }, () => randomBoolean()));
		expect(results.has(true)).toBe(true);
		expect(results.has(false)).toBe(true);
	});
});

describe('randomDirection', () => {
	it('returns only cw or ccw', () => {
		const result = randomDirection();
		expect(['cw', 'ccw']).toContain(result);
	});

	it('produces both directions over many runs', () => {
		const results = new Set(Array.from({ length: 100 }, () => randomDirection()));
		expect(results.has('cw')).toBe(true);
		expect(results.has('ccw')).toBe(true);
	});
});
