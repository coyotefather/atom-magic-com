import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { selectRandomElement, randomDirection } from '../utils/random';

// Types
interface Stone {
  player: 1 | 2;
  ring: number;  // -1 means unplaced
  cell: number;  // -1 means unplaced
}

export interface Cell {
  ring: number;
  cell: number;
  hasWall: boolean;
  hasBridge: boolean;
  stone: Stone | null;
}

export interface Coin {
  title: string;
  subtitle: string;
  aspect: 'um' | 'os' | 'umos';
  description: string;
  action: string;
}

export interface VoragoState {
  // Game meta
  round: number;
  turn: 1 | 2;
  gameWin: boolean;
  winner: 1 | 2 | null;

  // Players
  player1Name: string;
  player2Name: string;
  isAI: boolean;
  aiDifficulty: 'easy' | 'medium' | 'hard';

  // Score
  score: {
	player1: number;
	player2: number;
  };

  // Board state
  cells: Record<string, Cell>; // key: "ring-cell"
  degrees: number[]; // rotation for each ring [0,0,0,0,0]
  lockedRings: boolean[]; // [false,false,false,false,false]

  // Stones
  stones: {
	player1: Stone[];
	player2: Stone[];
  };

  // Coins
  availableCoins: Coin[];
  disabledCoins: {
	player1: string[];
	player2: string[];
  };
  coinsUsedThisRound: {
	player1: string[];
	player2: string[];
  };
  magnaDisabledCoin: string | null; // Coin disabled by Magna for both players next round

  // History tracking (for Mnemonic and Charlatan)
  lastStoneMove: {
	player1: { from: { ring: number; cell: number } | null; to: { ring: number; cell: number } | null } | null;
	player2: { from: { ring: number; cell: number } | null; to: { ring: number; cell: number } | null } | null;
  };
  lastCoinUsed: {
	player1: string | null;
	player2: string | null;
  };

  // Turn state
  hasMovedStone: boolean;
  hasUsedCoin: boolean;
  frozenRound: boolean;

  // UI state
  selectedStone: Stone | null;
  selectedCoin: string | null;
  showTurnDialog: boolean;
  displayMessage: string;
  isAIThinking: boolean;
}

const COINS: Coin[] = [
  {
	title: "Aura",
	subtitle: "The Eternal Shadow of Umos",
	aspect: "umos",
	description: "Transform a wall into a bridge or a bridge into a wall.",
	action: "transformWallBridge"
  },
  {
	title: "Mnemonic",
	subtitle: "The Memory of Umos",
	aspect: "um",
	description: "Return opponent's last moved stone to its previous position.",
	action: "returnOpponentStone"
  },
  {
	title: "Cadence",
	subtitle: "The Steward of Time",
	aspect: "um",
	description: "Reset a ring to its original position.",
	action: "resetRing"
  },
  {
	title: "Anathema",
	subtitle: "The Hammer of Umos",
	aspect: "um",
	description: "Lock a ring to prevent turning it.",
	action: "lockRing"
  },
  {
	title: "Gamma",
	subtitle: "The Savage Destroyer",
	aspect: "um",
	description: "Remove a bridge from a cell.",
	action: "removeBridge"
  },
  {
	title: "Magna",
	subtitle: "The Prime Ambassador",
	aspect: "um",
	description: "Choose any coin - neither player can use it next round.",
	action: "disableCoin"
  },
  {
	title: "Sovereign",
	subtitle: "The Power of the State",
	aspect: "um",
	description: "Place a wall in a cell.",
	action: "placeWall"
  },
  {
	title: "Rubicon",
	subtitle: "The Terror of Kings",
	aspect: "os",
	description: "Destroy a wall.",
	action: "removeWall"
  },
  {
	title: "Vertigo",
	subtitle: "The Voice of Discord",
	aspect: "os",
	description: "Spin one ring clockwise or counter-clockwise.",
	action: "spinRing"
  },
  {
	title: "Arcadia",
	subtitle: "The Sower of Life",
	aspect: "os",
	description: "Place a bridge in a cell.",
	action: "placeBridge"
  },
  {
	title: "Spectrum",
	subtitle: "The Heart of Solum",
	aspect: "os",
	description: "Move a wall or bridge to an adjacent empty cell.",
	action: "moveWallBridge"
  },
  {
	title: "Polyphony",
	subtitle: "The Chief Artist",
	aspect: "os",
	description: "Unlock a ring.",
	action: "unlockRing"
  },
  {
	title: "Charlatan",
	subtitle: "The Master of Lies",
	aspect: "os",
	description: "Use the action of the last coin your opponent played.",
	action: "copyOpponentCoin"
  }
];

// Helper to create cell map
function createCellMap(): Record<string, Cell> {
  const cells: Record<string, Cell> = {};
  const ringCellCounts = [32, 16, 16, 8, 4]; // Ring 1 same as Ring 2 (1:1 alignment)

  ringCellCounts.forEach((count, ringIndex) => {
	for (let cellIndex = 0; cellIndex < count; cellIndex++) {
	  const key = `${ringIndex}-${cellIndex}`;
	  cells[key] = {
		ring: ringIndex,
		cell: cellIndex,
		hasWall: false,
		hasBridge: false,
		stone: null
	  };
	}
  });

  return cells;
}

const initialState: VoragoState = {
  round: 1,
  turn: 1,
  gameWin: false,
  winner: null,
  player1Name: "Player 1",
  player2Name: "AI Opponent",
  isAI: true,
  aiDifficulty: 'medium',
  score: {
	player1: 0,
	player2: 0
  },
  cells: createCellMap(),
  degrees: [0, 0, 0, 0, 0],
  lockedRings: [false, false, false, false, false],
  stones: {
	  player1: [
		{ player: 1, ring: -1, cell: -1 },
		{ player: 1, ring: -1, cell: -1 },
		{ player: 1, ring: -1, cell: -1 }
	  ],
	  player2: [
		{ player: 2, ring: -1, cell: -1 },
		{ player: 2, ring: -1, cell: -1 },
		{ player: 2, ring: -1, cell: -1 }
	  ]
	},
  availableCoins: COINS,
  disabledCoins: {
	player1: [],
	player2: []
  },
  coinsUsedThisRound: {
	player1: [],
	player2: []
  },
  magnaDisabledCoin: null,
  lastStoneMove: {
	player1: null,
	player2: null
  },
  lastCoinUsed: {
	player1: null,
	player2: null
  },
  hasMovedStone: false,
  hasUsedCoin: false,
  frozenRound: false,
  selectedStone: null,
  selectedCoin: null,
  showTurnDialog: false,
  displayMessage: "Move a stone or use a coin",
  isAIThinking: false
};

// Async thunk for AI turn
export const executeAITurn = createAsyncThunk(
  'vorago/executeAITurn',
  async (_, { getState, dispatch }) => {
	const state = getState() as { vorago: VoragoState };
	const { isAI, aiDifficulty, turn } = state.vorago;

	console.log('🎮 executeAITurn called');
	console.log('  isAI:', isAI);
	console.log('  turn:', turn);

	if (!isAI || turn !== 2) {
	  console.log('  ❌ Skipping - not AI turn');
	  return;
	}

	console.log('  ✅ Starting AI turn...');

	// Set AI thinking state
	dispatch(voragoSlice.actions.setAIThinking(true));
	dispatch(voragoSlice.actions.setDisplayMessage('AI is thinking...'));

	// Wait a bit for realism
	await new Promise(resolve => setTimeout(resolve, 1000));

	try {
	  console.log('  📡 Calling AI API...');

	  const response = await fetch('/api/vorago-ai', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
		  gameState: state.vorago,
		  difficulty: aiDifficulty
		})
	  });

	  console.log('  📡 AI API response status:', response.status);

	  if (!response.ok) {
		const errorText = await response.text();
		console.error('  ❌ AI API error:', errorText);
		throw new Error('AI request failed');
	  }

	  const aiMove = await response.json();
	  console.log('  🎯 AI Move received:', aiMove);

	  // Execute the AI's stone move
	  if (aiMove.stoneMove) {
		console.log('  🔵 Moving stone:', aiMove.stoneMove);
		dispatch(voragoSlice.actions.moveStone({
		  stone: aiMove.stoneMove.stone,
		  toRing: aiMove.stoneMove.toRing,
		  toCell: aiMove.stoneMove.toCell
		}));
	  } else {
		console.log('  ⚠️ No stone move from AI');
	  }

	  // Wait a moment between actions
	  await new Promise(resolve => setTimeout(resolve, 500));

	  // Execute the AI's coin action
	  if (aiMove.coinAction) {
		console.log('  🪙 Using coin:', aiMove.coinAction);
		dispatch(voragoSlice.actions.useCoin(aiMove.coinAction.coinTitle));

		// Wait a bit then handle coin-specific actions
		await new Promise(resolve => setTimeout(resolve, 300));

		// Get current state for fallback logic
		const currentState = (getState() as { vorago: VoragoState }).vorago;
		const { lockedRings, cells } = currentState;

		// Helper to get a random unlocked ring
		const getRandomUnlockedRing = (): number => {
		  const unlocked = lockedRings.map((locked, i) => locked ? -1 : i).filter(i => i >= 0);
		  return selectRandomElement(unlocked) ?? 0;
		};

		// Helper to get a random locked ring
		const getRandomLockedRing = (): number | null => {
		  const locked = lockedRings.map((isLocked, i) => isLocked ? i : -1).filter(i => i >= 0);
		  return selectRandomElement(locked) ?? null;
		};

		// Helper to get a random empty cell (no wall, no bridge, no stone)
		const getRandomEmptyCell = (): { ring: number; cell: number } | null => {
		  const emptyCells: { ring: number; cell: number }[] = [];
		  Object.values(cells).forEach(cell => {
			if (!cell.hasWall && !cell.hasBridge && !cell.stone) {
			  emptyCells.push({ ring: cell.ring, cell: cell.cell });
			}
		  });
		  return selectRandomElement(emptyCells) ?? null;
		};

		// Handle coin-specific actions with fallbacks
		switch (aiMove.coinAction.action) {
		  case 'spinRing': {
			const ring = aiMove.coinAction.ring ?? getRandomUnlockedRing();
			const direction = aiMove.coinAction.direction ?? randomDirection();
			console.log('    ↻ Spinning ring', ring, direction);
			dispatch(voragoSlice.actions.spinRing({ ring, direction }));
			dispatch(voragoSlice.actions.completeCoinAction());
			break;
		  }
		  case 'resetRing': {
			const ring = aiMove.coinAction.ring ?? getRandomUnlockedRing();
			console.log('    ⟲ Resetting ring', ring);
			dispatch(voragoSlice.actions.resetRing(ring));
			dispatch(voragoSlice.actions.completeCoinAction());
			break;
		  }
		  case 'lockRing': {
			const ring = aiMove.coinAction.ring ?? getRandomUnlockedRing();
			console.log('    🔒 Locking ring', ring);
			dispatch(voragoSlice.actions.lockRing(ring));
			dispatch(voragoSlice.actions.completeCoinAction());
			break;
		  }
		  case 'unlockRing': {
			const ring = aiMove.coinAction.ring ?? getRandomLockedRing();
			if (ring !== null) {
			  console.log('    🔓 Unlocking ring', ring);
			  dispatch(voragoSlice.actions.unlockRing(ring));
			}
			dispatch(voragoSlice.actions.completeCoinAction());
			break;
		  }
		  case 'placeWall': {
			const target = (aiMove.coinAction.ring !== undefined && aiMove.coinAction.cell !== undefined)
			  ? { ring: aiMove.coinAction.ring, cell: aiMove.coinAction.cell }
			  : getRandomEmptyCell();
			if (target) {
			  console.log('    🧱 Placing wall at', target.ring, target.cell);
			  dispatch(voragoSlice.actions.placeWall(target));
			}
			dispatch(voragoSlice.actions.completeCoinAction());
			break;
		  }
		  case 'removeWall': {
			// Find a cell with a wall
			const wallCells = Object.values(cells).filter(c => c.hasWall);
			const target = (aiMove.coinAction.ring !== undefined && aiMove.coinAction.cell !== undefined)
			  ? { ring: aiMove.coinAction.ring, cell: aiMove.coinAction.cell }
			  : selectRandomElement(wallCells) ?? null;
			if (target) {
			  console.log('    💥 Removing wall at', target.ring, target.cell);
			  dispatch(voragoSlice.actions.removeWall({ ring: target.ring, cell: target.cell }));
			}
			dispatch(voragoSlice.actions.completeCoinAction());
			break;
		  }
		  case 'placeBridge': {
			const target = (aiMove.coinAction.ring !== undefined && aiMove.coinAction.cell !== undefined)
			  ? { ring: aiMove.coinAction.ring, cell: aiMove.coinAction.cell }
			  : getRandomEmptyCell();
			if (target) {
			  console.log('    🌉 Placing bridge at', target.ring, target.cell);
			  dispatch(voragoSlice.actions.placeBridge(target));
			}
			dispatch(voragoSlice.actions.completeCoinAction());
			break;
		  }
		  case 'removeBridge': {
			// Find a cell with a bridge
			const bridgeCells = Object.values(cells).filter(c => c.hasBridge);
			const target = (aiMove.coinAction.ring !== undefined && aiMove.coinAction.cell !== undefined)
			  ? { ring: aiMove.coinAction.ring, cell: aiMove.coinAction.cell }
			  : selectRandomElement(bridgeCells) ?? null;
			if (target) {
			  console.log('    🔥 Removing bridge at', target.ring, target.cell);
			  dispatch(voragoSlice.actions.removeBridge({ ring: target.ring, cell: target.cell }));
			}
			dispatch(voragoSlice.actions.completeCoinAction());
			break;
		  }
		  case 'transformWallBridge': {
			// Aura: Transform wall to bridge or vice versa
			const wallBridgeCells = Object.values(cells).filter(c => c.hasWall || c.hasBridge);
			const target = (aiMove.coinAction.ring !== undefined && aiMove.coinAction.cell !== undefined)
			  ? { ring: aiMove.coinAction.ring, cell: aiMove.coinAction.cell }
			  : selectRandomElement(wallBridgeCells) ?? null;
			if (target) {
			  console.log('    🔄 Transforming wall/bridge at', target.ring, target.cell);
			  dispatch(voragoSlice.actions.transformWallBridge({ ring: target.ring, cell: target.cell }));
			}
			dispatch(voragoSlice.actions.completeCoinAction());
			break;
		  }
		  case 'returnOpponentStone': {
			// Mnemonic: Return opponent's last moved stone
			console.log('    ↩️ Returning opponent stone');
			dispatch(voragoSlice.actions.returnOpponentStone());
			dispatch(voragoSlice.actions.completeCoinAction());
			break;
		  }
		  case 'disableCoin': {
			// Magna: Disable a coin for both players next round
			const targetCoin = aiMove.coinAction.targetCoin ?? 'Vertigo'; // Default to Vertigo
			console.log('    🚫 Disabling coin:', targetCoin);
			dispatch(voragoSlice.actions.setMagnaDisabledCoin(targetCoin));
			dispatch(voragoSlice.actions.completeCoinAction());
			break;
		  }
		  case 'moveWallBridge': {
			// Spectrum: Move wall/bridge to adjacent cell
			const wallBridgeCells2 = Object.values(cells).filter(c => c.hasWall || c.hasBridge);
			if (wallBridgeCells2.length > 0) {
			  const source = (aiMove.coinAction.fromRing !== undefined && aiMove.coinAction.fromCell !== undefined)
				? { ring: aiMove.coinAction.fromRing, cell: aiMove.coinAction.fromCell }
				: selectRandomElement(wallBridgeCells2)!;
			  // Simple: move to next cell in same ring
			  const ringCellCounts = [32, 16, 16, 8, 4];
			  const destCell = (source.cell + 1) % ringCellCounts[source.ring];
			  console.log('    ➡️ Moving wall/bridge from', source.ring, source.cell, 'to', source.ring, destCell);
			  dispatch(voragoSlice.actions.moveWallBridge({
				from: { ring: source.ring, cell: source.cell },
				to: { ring: source.ring, cell: destCell }
			  }));
			}
			dispatch(voragoSlice.actions.completeCoinAction());
			break;
		  }
		  case 'copyOpponentCoin': {
			// Charlatan: Copy opponent's last coin (simplified - just complete)
			console.log('    🎭 Copying opponent coin:', aiMove.coinAction.copiedCoin);
			dispatch(voragoSlice.actions.completeCoinAction());
			break;
		  }
		  default:
			console.log('    ℹ️ No special action for', aiMove.coinAction.action);
			dispatch(voragoSlice.actions.completeCoinAction());
		}
	  } else {
		console.log('  ⚠️ No coin action from AI');
	  }

	  dispatch(voragoSlice.actions.setDisplayMessage('AI turn complete'));
	  console.log('  ✅ AI turn complete');

	  // Wait a moment then end turn
	  await new Promise(resolve => setTimeout(resolve, 1000));

	  // End the AI's turn
	  console.log('  🔄 Ending AI turn...');
	  dispatch(voragoSlice.actions.setAIThinking(false));
	  dispatch(voragoSlice.actions.endTurn());

	} catch (error) {
	  console.error('  ❌ AI turn error:', error);
	  dispatch(voragoSlice.actions.setDisplayMessage('AI error - ending turn'));

	  await new Promise(resolve => setTimeout(resolve, 1500));

	  // End turn anyway to prevent getting stuck
	  dispatch(voragoSlice.actions.setAIThinking(false));
	  dispatch(voragoSlice.actions.endTurn());
	}
  }
);

const voragoSlice = createSlice({
  name: 'vorago',
  initialState,
  reducers: {
	// Game setup
	newGame: (state) => {
	  const cellMap = createCellMap();

	  // Initialize stones as unplaced (they start off the board)
	  const player1Stones: Stone[] = [];
	  const player2Stones: Stone[] = [];

	  for (let i = 0; i < 3; i++) {
		player1Stones.push({ player: 1, ring: -1, cell: -1 }); // -1 means unplaced
		player2Stones.push({ player: 2, ring: -1, cell: -1 });
	  }

	  Object.assign(state, {
		...initialState,
		cells: cellMap,
		stones: {
		  player1: player1Stones,
		  player2: player2Stones
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

	  // Each ring rotates by exactly one cell
	  // Ring cell counts: [32, 16, 16, 8, 4] from ring 0-4
	  const cellCounts = [32, 16, 16, 8, 4];
	  const increment = 360 / cellCounts[ring];

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

export default voragoSlice.reducer;