import { describe, it, expect } from 'vitest';
import { deconflictLabels } from '@/lib/label-config';
import type { LabelConfig } from '@/lib/label-config';

const base: Omit<LabelConfig, 'regionId' | 'name' | 'svgX' | 'svgY'> = {
	fontSize: 9, angle: 0, dx: 0, dy: 0,
};

describe('deconflictLabels', () => {
	it('leaves non-overlapping labels unchanged', () => {
		const labels: LabelConfig[] = [
			{ ...base, regionId: 'a', name: 'FOO', svgX: 100, svgY: 100 },
			{ ...base, regionId: 'b', name: 'BAR', svgX: 400, svgY: 400 },
		];
		const result = deconflictLabels(labels);
		expect(result.find(l => l.regionId === 'a')!.svgY).toBe(100);
		expect(result.find(l => l.regionId === 'b')!.svgY).toBe(400);
	});

	it('nudges overlapping labels apart in Y', () => {
		const labels: LabelConfig[] = [
			{ ...base, regionId: 'a', name: 'ALPHA', svgX: 100, svgY: 100 },
			{ ...base, regionId: 'b', name: 'BETA', svgX: 100, svgY: 103 },
		];
		const result = deconflictLabels(labels);
		const posA = result.find(l => l.regionId === 'a')!;
		const posB = result.find(l => l.regionId === 'b')!;
		expect(Math.abs(posA.svgY - posB.svgY)).toBeGreaterThan(9 * 1.25);
	});

	it('preserves order of returned array', () => {
		const labels: LabelConfig[] = [
			{ ...base, regionId: 'a', name: 'FOO', svgX: 100, svgY: 100 },
			{ ...base, regionId: 'b', name: 'BAR', svgX: 100, svgY: 103 },
		];
		const result = deconflictLabels(labels);
		expect(result[0].regionId).toBe('a');
		expect(result[1].regionId).toBe('b');
	});

	it('larger fontSize label takes priority (stays at original position)', () => {
		const labels: LabelConfig[] = [
			{ ...base, regionId: 'small', name: 'TINY', svgX: 100, svgY: 100, fontSize: 6 },
			{ ...base, regionId: 'big', name: 'LARGE', svgX: 100, svgY: 103, fontSize: 9 },
		];
		const result = deconflictLabels(labels);
		const bigResult = result.find(l => l.regionId === 'big')!;
		expect(bigResult.svgY).toBe(103);
	});
});
