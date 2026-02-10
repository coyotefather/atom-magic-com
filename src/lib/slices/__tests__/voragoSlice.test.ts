import reducer, {
	moveStone,
	spinRing,
	placeWall,
	removeWall,
	placeBridge,
	removeBridge,
	transformWallBridge,
	lockRing,
	unlockRing,
	resetRing,
	returnOpponentStone,
	setMagnaDisabledCoin,
	moveWallBridge,
	endTurn,
} from '@/lib/slices/voragoSlice';
import { initialState, RING_CELL_COUNTS } from '@/lib/slices/voragoConstants';
import type { VoragoState } from '@/lib/slices/voragoTypes';

/** Deep-clone initialState so each test starts fresh. */
function freshState(overrides?: Partial<VoragoState>): VoragoState {
	return structuredClone({ ...initialState, ...overrides }) as VoragoState;
}

// ---------------------------------------------------------------------------
// Stone movement
// ---------------------------------------------------------------------------
describe('moveStone', () => {
	it('places an unplaced stone onto ring 0', () => {
		const state = freshState();
		const stone = { player: 1 as const, ring: -1, cell: -1 };
		const next = reducer(state, moveStone({ stone, toRing: 0, toCell: 5 }));

		expect(next.cells['0-5'].stone).toEqual({ player: 1, ring: 0, cell: 5 });
		expect(next.stones.player1.some(s => s.ring === 0 && s.cell === 5)).toBe(true);
		expect(next.hasMovedStone).toBe(true);
	});

	it('moves an existing stone between cells', () => {
		const state = freshState();
		// Place first
		let next = reducer(state, moveStone({ stone: { player: 1, ring: -1, cell: -1 }, toRing: 0, toCell: 3 }));
		// Move it
		const placed = { player: 1 as const, ring: 0, cell: 3 };
		next = reducer(next, moveStone({ stone: placed, toRing: 1, toCell: 2 }));

		expect(next.cells['0-3'].stone).toBeNull();
		expect(next.cells['1-2'].stone).toEqual({ player: 1, ring: 1, cell: 2 });
	});

	it('scores a stone moved to ring 5', () => {
		const state = freshState();
		// Place on ring 4
		let next = reducer(state, moveStone({ stone: { player: 1, ring: -1, cell: -1 }, toRing: 4, toCell: 0 }));
		// Score it
		next = reducer(next, moveStone({ stone: { player: 1, ring: 4, cell: 0 }, toRing: 5, toCell: 0 }));

		expect(next.score.player1).toBe(1);
		expect(next.stones.player1.some(s => s.ring === 99 && s.cell === 99)).toBe(true);
		expect(next.gameWin).toBe(false);
	});

	it('triggers win when 3rd stone is scored', () => {
		const state = freshState();
		// Pre-set score to 2
		state.score.player1 = 2;
		// Place and score the 3rd stone
		let next = reducer(state, moveStone({ stone: { player: 1, ring: -1, cell: -1 }, toRing: 4, toCell: 1 }));
		next = reducer(next, moveStone({ stone: { player: 1, ring: 4, cell: 1 }, toRing: 5, toCell: 0 }));

		expect(next.score.player1).toBe(3);
		expect(next.gameWin).toBe(true);
		expect(next.winner).toBe(1);
	});

	it('tracks lastStoneMove for Mnemonic', () => {
		const state = freshState();
		// Place a stone
		let next = reducer(state, moveStone({ stone: { player: 1, ring: -1, cell: -1 }, toRing: 0, toCell: 7 }));
		expect(next.lastStoneMove.player1).toEqual({
			from: null,
			to: { ring: 0, cell: 7 },
		});

		// Move it further
		next = reducer(next, moveStone({ stone: { player: 1, ring: 0, cell: 7 }, toRing: 1, toCell: 3 }));
		expect(next.lastStoneMove.player1).toEqual({
			from: { ring: 0, cell: 7 },
			to: { ring: 1, cell: 3 },
		});
	});
});

// ---------------------------------------------------------------------------
// Ring rotation
// ---------------------------------------------------------------------------
describe('spinRing', () => {
	it('rotates clockwise by 360/cellCount degrees', () => {
		const state = freshState();
		const next = reducer(state, spinRing({ ring: 0, direction: 'cw' }));
		expect(next.degrees[0]).toBeCloseTo(360 / 32);
	});

	it('rotates counter-clockwise', () => {
		const state = freshState();
		const next = reducer(state, spinRing({ ring: 3, direction: 'ccw' }));
		expect(next.degrees[3]).toBeCloseTo(-360 / 8);
	});

	it('accumulates across multiple spins', () => {
		const state = freshState();
		let next = reducer(state, spinRing({ ring: 1, direction: 'cw' }));
		next = reducer(next, spinRing({ ring: 1, direction: 'cw' }));
		const increment = 360 / RING_CELL_COUNTS[1];
		expect(next.degrees[1]).toBeCloseTo(increment * 2);
	});
});

// ---------------------------------------------------------------------------
// Coin effect reducers
// ---------------------------------------------------------------------------
describe('coin effects', () => {
	it('placeWall sets hasWall on a cell', () => {
		const next = reducer(freshState(), placeWall({ ring: 2, cell: 5 }));
		expect(next.cells['2-5'].hasWall).toBe(true);
	});

	it('removeWall clears hasWall on a cell', () => {
		const state = freshState();
		state.cells['1-3'].hasWall = true;
		const next = reducer(state, removeWall({ ring: 1, cell: 3 }));
		expect(next.cells['1-3'].hasWall).toBe(false);
	});

	it('placeBridge sets hasBridge on a cell', () => {
		const next = reducer(freshState(), placeBridge({ ring: 0, cell: 10 }));
		expect(next.cells['0-10'].hasBridge).toBe(true);
	});

	it('removeBridge clears hasBridge on a cell', () => {
		const state = freshState();
		state.cells['3-2'].hasBridge = true;
		const next = reducer(state, removeBridge({ ring: 3, cell: 2 }));
		expect(next.cells['3-2'].hasBridge).toBe(false);
	});

	it('transformWallBridge converts a wall to a bridge', () => {
		const state = freshState();
		state.cells['0-0'].hasWall = true;
		const next = reducer(state, transformWallBridge({ ring: 0, cell: 0 }));
		expect(next.cells['0-0'].hasWall).toBe(false);
		expect(next.cells['0-0'].hasBridge).toBe(true);
	});

	it('transformWallBridge converts a bridge to a wall', () => {
		const state = freshState();
		state.cells['0-0'].hasBridge = true;
		const next = reducer(state, transformWallBridge({ ring: 0, cell: 0 }));
		expect(next.cells['0-0'].hasBridge).toBe(false);
		expect(next.cells['0-0'].hasWall).toBe(true);
	});

	it('lockRing locks the specified ring', () => {
		const next = reducer(freshState(), lockRing(2));
		expect(next.lockedRings[2]).toBe(true);
	});

	it('unlockRing unlocks the specified ring', () => {
		const state = freshState();
		state.lockedRings[2] = true;
		const next = reducer(state, unlockRing(2));
		expect(next.lockedRings[2]).toBe(false);
	});

	it('resetRing sets degrees to 0', () => {
		const state = freshState();
		state.degrees[1] = 45;
		const next = reducer(state, resetRing(1));
		expect(next.degrees[1]).toBe(0);
	});

	it('setMagnaDisabledCoin stores the coin title', () => {
		const next = reducer(freshState(), setMagnaDisabledCoin('Vertigo'));
		expect(next.magnaDisabledCoin).toBe('Vertigo');
	});

	it('moveWallBridge moves a wall between cells', () => {
		const state = freshState();
		state.cells['0-1'].hasWall = true;
		const next = reducer(state, moveWallBridge({
			from: { ring: 0, cell: 1 },
			to: { ring: 0, cell: 2 },
		}));
		expect(next.cells['0-1'].hasWall).toBe(false);
		expect(next.cells['0-2'].hasWall).toBe(true);
	});

	it('moveWallBridge moves a bridge between cells', () => {
		const state = freshState();
		state.cells['2-3'].hasBridge = true;
		const next = reducer(state, moveWallBridge({
			from: { ring: 2, cell: 3 },
			to: { ring: 2, cell: 4 },
		}));
		expect(next.cells['2-3'].hasBridge).toBe(false);
		expect(next.cells['2-4'].hasBridge).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// returnOpponentStone (Mnemonic)
// ---------------------------------------------------------------------------
describe('returnOpponentStone', () => {
	it('returns opponent stone to its previous position', () => {
		const state = freshState();
		// Player 2 moves a stone from 0-5 to 1-2
		state.cells['1-2'].stone = { player: 2, ring: 1, cell: 2 };
		state.stones.player2[0] = { player: 2, ring: 1, cell: 2 };
		state.lastStoneMove.player2 = {
			from: { ring: 0, cell: 5 },
			to: { ring: 1, cell: 2 },
		};
		// Player 1's turn, uses Mnemonic
		state.turn = 1;
		const next = reducer(state, returnOpponentStone());

		expect(next.cells['1-2'].stone).toBeNull();
		expect(next.cells['0-5'].stone).toEqual({ player: 2, ring: 0, cell: 5 });
		expect(next.stones.player2[0]).toEqual({ player: 2, ring: 0, cell: 5 });
	});

	it('returns a newly-placed stone to unplaced state', () => {
		const state = freshState();
		// Player 2 places a new stone at 0-10
		state.cells['0-10'].stone = { player: 2, ring: 0, cell: 10 };
		state.stones.player2[0] = { player: 2, ring: 0, cell: 10 };
		state.lastStoneMove.player2 = {
			from: null,
			to: { ring: 0, cell: 10 },
		};
		state.turn = 1;
		const next = reducer(state, returnOpponentStone());

		expect(next.cells['0-10'].stone).toBeNull();
		expect(next.stones.player2[0]).toEqual({ player: 2, ring: -1, cell: -1 });
	});
});

// ---------------------------------------------------------------------------
// Turn management
// ---------------------------------------------------------------------------
describe('endTurn', () => {
	it('rejects if stone not moved', () => {
		const state = freshState();
		state.hasUsedCoin = true;
		state.hasMovedStone = false;
		const next = reducer(state, endTurn());
		expect(next.turn).toBe(1); // unchanged
		expect(next.displayMessage).toContain('must move a stone AND use a coin');
	});

	it('rejects if coin not used', () => {
		const state = freshState();
		state.hasMovedStone = true;
		state.hasUsedCoin = false;
		const next = reducer(state, endTurn());
		expect(next.turn).toBe(1);
	});

	it('switches turn from 1 to 2', () => {
		const state = freshState();
		state.hasMovedStone = true;
		state.hasUsedCoin = true;
		const next = reducer(state, endTurn());
		expect(next.turn).toBe(2);
		expect(next.hasMovedStone).toBe(false);
		expect(next.hasUsedCoin).toBe(false);
	});

	it('increments round when turn returns to player 1', () => {
		const state = freshState();
		state.turn = 2;
		state.round = 1;
		state.hasMovedStone = true;
		state.hasUsedCoin = true;
		const next = reducer(state, endTurn());
		expect(next.turn).toBe(1);
		expect(next.round).toBe(2);
	});

	it('rotates cooldowns: coinsUsedThisRound becomes disabledCoins', () => {
		const state = freshState();
		state.turn = 2;
		state.hasMovedStone = true;
		state.hasUsedCoin = true;
		state.coinsUsedThisRound.player1 = ['Sovereign'];
		state.coinsUsedThisRound.player2 = ['Rubicon'];
		const next = reducer(state, endTurn());

		expect(next.disabledCoins.player1).toEqual(['Sovereign']);
		expect(next.disabledCoins.player2).toEqual(['Rubicon']);
		expect(next.coinsUsedThisRound.player1).toEqual([]);
		expect(next.coinsUsedThisRound.player2).toEqual([]);
	});

	it('applies Magna-disabled coin to both players', () => {
		const state = freshState();
		state.turn = 2;
		state.hasMovedStone = true;
		state.hasUsedCoin = true;
		state.magnaDisabledCoin = 'Vertigo';
		const next = reducer(state, endTurn());

		expect(next.disabledCoins.player1).toContain('Vertigo');
		expect(next.disabledCoins.player2).toContain('Vertigo');
		expect(next.magnaDisabledCoin).toBeNull();
	});
});
