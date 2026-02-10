import { RING_CELL_COUNTS, createCellMap, createInitialStones } from '@/lib/slices/voragoConstants';

describe('RING_CELL_COUNTS', () => {
	it('has the expected ring sizes', () => {
		expect([...RING_CELL_COUNTS]).toEqual([32, 16, 16, 8, 4]);
	});
});

describe('createCellMap', () => {
	const cells = createCellMap();
	const keys = Object.keys(cells);

	it('creates 76 total cells', () => {
		expect(keys).toHaveLength(76);
	});

	it('creates the correct number of cells per ring', () => {
		RING_CELL_COUNTS.forEach((count, ring) => {
			const ringKeys = keys.filter(k => k.startsWith(`${ring}-`));
			expect(ringKeys).toHaveLength(count);
		});
	});

	it('initializes all cells with no walls, bridges, or stones', () => {
		for (const key of keys) {
			expect(cells[key].hasWall).toBe(false);
			expect(cells[key].hasBridge).toBe(false);
			expect(cells[key].stone).toBeNull();
		}
	});
});

describe('createInitialStones', () => {
	it('creates 3 unplaced stones for player 1', () => {
		const stones = createInitialStones(1);
		expect(stones).toHaveLength(3);
		for (const stone of stones) {
			expect(stone).toEqual({ player: 1, ring: -1, cell: -1 });
		}
	});

	it('creates 3 unplaced stones for player 2', () => {
		const stones = createInitialStones(2);
		expect(stones).toHaveLength(3);
		for (const stone of stones) {
			expect(stone).toEqual({ player: 2, ring: -1, cell: -1 });
		}
	});
});
