import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Import types
import type { Stone, VoragoState } from './voragoTypes';

// Import constants
import { COINS, createCellMap, createInitialStones, initialState, RING_CELL_COUNTS } from './voragoConstants';

// Import and inject AI thunk
import { executeAITurn, injectSliceActions } from './voragoAIThunk';

// Re-export types for consumers
export type { Stone, Cell, Coin, VoragoState } from './voragoTypes';

// Re-export constants for consumers
export { COINS, RING_CELL_COUNTS } from './voragoConstants';

const voragoSlice = createSlice({
  name: 'vorago',
  initialState,
  reducers: {
	// Game setup
	newGame: (state) => {
	  const cellMap = createCellMap();

	  Object.assign(state, {
		...initialState,
		cells: cellMap,
		stones: {
		  player1: createInitialStones(1),
		  player2: createInitialStones(2)
		},
		player1Name: state.player1Name,
		player2Name: state.player2Name,
		isAI: state.isAI,
		aiDifficulty: state.aiDifficulty
	  });
	},

	setPlayerNames: (state, action: PayloadAction<{ player1: string; player2: string }>) => {
	  state.player1Name = action.payload.player1;
	  state.player2Name = action.payload.player2;
	},

	setAIMode: (state, action: PayloadAction<{ enabled: boolean; difficulty?: 'easy' | 'medium' | 'hard' }>) => {
	  state.isAI = action.payload.enabled;
	  if (action.payload.difficulty) {
		state.aiDifficulty = action.payload.difficulty;
	  }
	},

	// Stone movement
	moveStone: (state, action: PayloadAction<{ stone: Stone; toRing: number; toCell: number }>) => {
	  const { stone, toRing, toCell } = action.payload;
	  const playerKey = `player${stone.player}` as 'player1' | 'player2';

	  // Track the last stone move for Mnemonic
	  const fromPos = (stone.ring >= 0 && stone.ring < 5)
		? { ring: stone.ring, cell: stone.cell }
		: null;
	  state.lastStoneMove[playerKey] = {
		from: fromPos,
		to: { ring: toRing, cell: toCell }
	  };

	  // If stone was previously placed, remove it from old position
	  if (stone.ring >= 0 && stone.ring < 5 && stone.cell >= 0) {
		const fromKey = `${stone.ring}-${stone.cell}`;
		state.cells[fromKey].stone = null;
	  }

	  // Check if moving to goal (ring 5)
	  if (toRing === 5) {
		// Don't place stone in cells - it goes to goal and disappears from board
		state.score[playerKey]++;

		// Remove stone from stones array (it's scored now)
		const stoneArray = state.stones[playerKey];
		const stoneIndex = stoneArray.findIndex(s =>
		  s.ring === stone.ring && s.cell === stone.cell
		);

		if (stoneIndex >= 0) {
		  // Mark as scored by setting to a special state (ring: 99, cell: 99)
		  stoneArray[stoneIndex] = { ...stone, ring: 99, cell: 99 };
		}

		// Check win condition
		if (state.score[playerKey] === 3) {
		  state.gameWin = true;
		  state.winner = stone.player;
		}

		state.displayMessage = `${playerKey === 'player1' ? state.player1Name : state.player2Name} scored! (${state.score[playerKey]}/3)`;
	  } else {
		// Normal move - place on board
		const toKey = `${toRing}-${toCell}`;
		state.cells[toKey].stone = { ...stone, ring: toRing, cell: toCell };

		// Update in stones array
		const stoneArray = state.stones[playerKey];
		const stoneIndex = stoneArray.findIndex(s =>
		  (s.ring === stone.ring && s.cell === stone.cell) ||
		  (s.ring === -1 && stone.ring === -1)
		);

		if (stoneIndex >= 0) {
		  stoneArray[stoneIndex] = { ...stone, ring: toRing, cell: toCell };
		}
	  }

	  state.hasMovedStone = true;
	  state.selectedStone = null;
	},

	// Select unplaced coin
	selectUnplacedStone: (state, action: PayloadAction<{ player: 1 | 2; index: number }>) => {
	  const { player, index } = action.payload;
	  const stone = state.stones[`player${player}` as 'player1' | 'player2'][index];

	  if (stone && stone.ring === -1) {
		state.selectedStone = stone;
		state.displayMessage = `Click a cell on the outermost ring to place your stone`;
	  }
	},

	// Coin actions
	useCoin: (state, action: PayloadAction<string>) => {
	  // Just select the coin - don't mark as used yet
	  // hasUsedCoin will be set when the action is fully complete
	  state.selectedCoin = action.payload;
	},

	// Called when a coin action is fully completed
	completeCoinAction: (state) => {
	  if (state.selectedCoin) {
		const player = `player${state.turn}` as 'player1' | 'player2';
		state.coinsUsedThisRound[player].push(state.selectedCoin);
		state.lastCoinUsed[player] = state.selectedCoin;
		state.hasUsedCoin = true;
		state.selectedCoin = null;
	  }
	},

	// Called when user cancels a coin action
	cancelCoin: (state) => {
	  state.selectedCoin = null;
	},

	spinRing: (state, action: PayloadAction<{ ring: number; direction: 'cw' | 'ccw' }>) => {
	  const { ring, direction } = action.payload;
	  const increment = 360 / RING_CELL_COUNTS[ring];
	  const rotation = direction === 'cw' ? increment : -increment;
	  state.degrees[ring] = (state.degrees[ring] + rotation) % 360;
	},

	resetRing: (state, action: PayloadAction<number>) => {
	  state.degrees[action.payload] = 0;
	},

	lockRing: (state, action: PayloadAction<number>) => {
	  state.lockedRings[action.payload] = true;
	},

	unlockRing: (state, action: PayloadAction<number>) => {
	  state.lockedRings[action.payload] = false;
	},

	placeWall: (state, action: PayloadAction<{ ring: number; cell: number }>) => {
	  const { ring, cell } = action.payload;
	  const cellKey = `${ring}-${cell}`;
	  state.cells[cellKey].hasWall = true;
	},

	removeWall: (state, action: PayloadAction<{ ring: number; cell: number }>) => {
	  const key = `${action.payload.ring}-${action.payload.cell}`;
	  state.cells[key].hasWall = false;
	},

	placeBridge: (state, action: PayloadAction<{ ring: number; cell: number }>) => {
	  const { ring, cell } = action.payload;
	  const cellKey = `${ring}-${cell}`;
	  state.cells[cellKey].hasBridge = true;
	},

	removeBridge: (state, action: PayloadAction<{ ring: number; cell: number }>) => {
	  const key = `${action.payload.ring}-${action.payload.cell}`;
	  state.cells[key].hasBridge = false;
	},

	// Aura: Transform wall to bridge or bridge to wall
	transformWallBridge: (state, action: PayloadAction<{ ring: number; cell: number }>) => {
	  const key = `${action.payload.ring}-${action.payload.cell}`;
	  const cell = state.cells[key];
	  if (cell.hasWall) {
		cell.hasWall = false;
		cell.hasBridge = true;
	  } else if (cell.hasBridge) {
		cell.hasBridge = false;
		cell.hasWall = true;
	  }
	},

	// Mnemonic: Return opponent's last moved stone to its previous position
	returnOpponentStone: (state) => {
	  const opponent = state.turn === 1 ? 'player2' : 'player1';
	  const lastMove = state.lastStoneMove[opponent];

	  if (!lastMove || !lastMove.to) return;

	  // Find the stone at the "to" position
	  const toKey = `${lastMove.to.ring}-${lastMove.to.cell}`;
	  const stone = state.cells[toKey]?.stone;

	  if (!stone) return;

	  // Remove from current position
	  state.cells[toKey].stone = null;

	  // If there was a previous position, move it back there
	  if (lastMove.from) {
		const fromKey = `${lastMove.from.ring}-${lastMove.from.cell}`;
		state.cells[fromKey].stone = { ...stone, ring: lastMove.from.ring, cell: lastMove.from.cell };

		// Update in stones array
		const stoneArray = state.stones[opponent];
		const stoneIndex = stoneArray.findIndex(s =>
		  s.ring === lastMove.to!.ring && s.cell === lastMove.to!.cell
		);
		if (stoneIndex >= 0) {
		  stoneArray[stoneIndex] = { ...stone, ring: lastMove.from.ring, cell: lastMove.from.cell };
		}
	  } else {
		// Stone was newly placed, return to unplaced state
		const stoneArray = state.stones[opponent];
		const stoneIndex = stoneArray.findIndex(s =>
		  s.ring === lastMove.to!.ring && s.cell === lastMove.to!.cell
		);
		if (stoneIndex >= 0) {
		  stoneArray[stoneIndex] = { ...stone, ring: -1, cell: -1 };
		}
	  }

	  // Clear opponent's last move since we undid it
	  state.lastStoneMove[opponent] = null;
	},

	// Magna: Set a coin to be disabled for both players next round
	setMagnaDisabledCoin: (state, action: PayloadAction<string>) => {
	  state.magnaDisabledCoin = action.payload;
	},

	// Spectrum: Move a wall or bridge to an adjacent empty cell
	moveWallBridge: (state, action: PayloadAction<{
	  from: { ring: number; cell: number };
	  to: { ring: number; cell: number };
	}>) => {
	  const { from, to } = action.payload;
	  const fromKey = `${from.ring}-${from.cell}`;
	  const toKey = `${to.ring}-${to.cell}`;
	  const fromCell = state.cells[fromKey];
	  const toCell = state.cells[toKey];

	  if (fromCell.hasWall) {
		fromCell.hasWall = false;
		toCell.hasWall = true;
	  } else if (fromCell.hasBridge) {
		fromCell.hasBridge = false;
		toCell.hasBridge = true;
	  }
	},

	// Turn management
	endTurn: (state) => {
	  if (!state.hasMovedStone || !state.hasUsedCoin) {
		state.displayMessage = 'You must move a stone AND use a coin before ending your turn';
		return;
	  }

	  // Switch turns
	  state.turn = state.turn === 1 ? 2 : 1;
	  state.hasMovedStone = false;
	  state.hasUsedCoin = false;
	  state.selectedStone = null;
	  state.selectedCoin = null;

	  // Update round if back to player 1
	  if (state.turn === 1) {
		state.round++;

		// Rotate disabled coins:
		// 1. Clear coins that were disabled last round (they're now available)
		// 2. Move coins used this round to disabled (they'll be disabled next round)
		state.disabledCoins.player1 = [...state.coinsUsedThisRound.player1];
		state.disabledCoins.player2 = [...state.coinsUsedThisRound.player2];

		// Add Magna-disabled coin to both players' disabled lists
		if (state.magnaDisabledCoin) {
		  if (!state.disabledCoins.player1.includes(state.magnaDisabledCoin)) {
			state.disabledCoins.player1.push(state.magnaDisabledCoin);
		  }
		  if (!state.disabledCoins.player2.includes(state.magnaDisabledCoin)) {
			state.disabledCoins.player2.push(state.magnaDisabledCoin);
		  }
		  state.magnaDisabledCoin = null; // Clear after applying
		}

		state.coinsUsedThisRound.player1 = [];
		state.coinsUsedThisRound.player2 = [];
	  }

	  state.displayMessage = state.turn === 1 ?
		`${state.player1Name}'s turn` :
		`${state.player2Name}'s turn`;

	  // NOTE: We'll trigger AI turn from the component, not here
	},

	// UI state
	setDisplayMessage: (state, action: PayloadAction<string>) => {
	  state.displayMessage = action.payload;
	},

	selectStone: (state, action: PayloadAction<Stone | null>) => {
	  state.selectedStone = action.payload;
	},

	setAIThinking: (state, action: PayloadAction<boolean>) => {
	  state.isAIThinking = action.payload;
	}
  }
});

// Inject actions into the AI thunk to avoid circular dependency
injectSliceActions(voragoSlice.actions);

// Export actions
export const {
  newGame,
  setPlayerNames,
  setAIMode,
  moveStone,
  useCoin,
  completeCoinAction,
  cancelCoin,
  spinRing,
  resetRing,
  lockRing,
  unlockRing,
  placeWall,
  removeWall,
  placeBridge,
  removeBridge,
  transformWallBridge,
  returnOpponentStone,
  setMagnaDisabledCoin,
  moveWallBridge,
  endTurn,
  setDisplayMessage,
  selectUnplacedStone,
  selectStone,
  setAIThinking
} = voragoSlice.actions;

// Re-export the AI thunk
export { executeAITurn };

export default voragoSlice.reducer;
