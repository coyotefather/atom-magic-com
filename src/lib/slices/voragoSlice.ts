import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

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
  aiDifficulty: 'easy' | 'medium' | 'hard' | 'expert';

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

  // Turn state
  hasMovedStone: boolean;
  hasUsedCoin: boolean;
  frozenRound: boolean;

  // UI state
  selectedStone: Stone | null;
  selectedCoin: string | null;
  showTurnDialog: boolean;
  displayMessage: string;
}

const COINS: Coin[] = [
  {
	title: "Aura",
	subtitle: "The Eternal Shadow of Umos",
	aspect: "umos",
	description: "Place a stone on the outermost ring.",
	action: "placeStone"
  },
  {
	title: "Mnemonic",
	subtitle: "The Memory of Umos",
	aspect: "um",
	description: "Repeat the action from the last coin you played.",
	action: "repeatCoin"
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
	description: "Prevent all movement of stones the next round.",
	action: "freezeRound"
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
	description: "Move a stone between rings.",
	action: "moveBetweenRings"
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
	description: "Move a stone within the same ring.",
	action: "moveWithinRing"
  }
];

// Helper to create cell map
function createCellMap(): Record<string, Cell> {
  const cells: Record<string, Cell> = {};
  const ringCellCounts = [12, 10, 8, 6, 4]; // cells per ring

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
  hasMovedStone: false,
  hasUsedCoin: false,
  frozenRound: false,
  selectedStone: null,
  selectedCoin: null,
  showTurnDialog: false,
  displayMessage: "Move a stone or use a coin"
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

	// Show turn dialog
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

		// Handle coin-specific actions
		switch (aiMove.coinAction.action) {
		  case 'spinRing':
			if (aiMove.coinAction.ring !== undefined && aiMove.coinAction.direction) {
			  console.log('    ↻ Spinning ring', aiMove.coinAction.ring, aiMove.coinAction.direction);
			  dispatch(voragoSlice.actions.spinRing({
				ring: aiMove.coinAction.ring,
				direction: aiMove.coinAction.direction
			  }));
			}
			break;
		  case 'resetRing':
			if (aiMove.coinAction.ring !== undefined) {
			  console.log('    ⟲ Resetting ring', aiMove.coinAction.ring);
			  dispatch(voragoSlice.actions.resetRing(aiMove.coinAction.ring));
			}
			break;
		  case 'lockRing':
			if (aiMove.coinAction.ring !== undefined) {
			  console.log('    🔒 Locking ring', aiMove.coinAction.ring);
			  dispatch(voragoSlice.actions.lockRing(aiMove.coinAction.ring));
			}
			break;
		  case 'unlockRing':
			if (aiMove.coinAction.ring !== undefined) {
			  console.log('    🔓 Unlocking ring', aiMove.coinAction.ring);
			  dispatch(voragoSlice.actions.unlockRing(aiMove.coinAction.ring));
			}
			break;
		  case 'placeWall':
			if (aiMove.coinAction.ring !== undefined && aiMove.coinAction.cell !== undefined) {
			  console.log('    🧱 Placing wall at', aiMove.coinAction.ring, aiMove.coinAction.cell);
			  dispatch(voragoSlice.actions.placeWall({
				ring: aiMove.coinAction.ring,
				cell: aiMove.coinAction.cell
			  }));
			}
			break;
		  case 'removeWall':
			if (aiMove.coinAction.ring !== undefined && aiMove.coinAction.cell !== undefined) {
			  console.log('    💥 Removing wall at', aiMove.coinAction.ring, aiMove.coinAction.cell);
			  dispatch(voragoSlice.actions.removeWall({
				ring: aiMove.coinAction.ring,
				cell: aiMove.coinAction.cell
			  }));
			}
			break;
		  case 'placeBridge':
			if (aiMove.coinAction.ring !== undefined && aiMove.coinAction.cell !== undefined) {
			  console.log('    🌉 Placing bridge at', aiMove.coinAction.ring, aiMove.coinAction.cell);
			  dispatch(voragoSlice.actions.placeBridge({
				ring: aiMove.coinAction.ring,
				cell: aiMove.coinAction.cell
			  }));
			}
			break;
		  case 'removeBridge':
			if (aiMove.coinAction.ring !== undefined && aiMove.coinAction.cell !== undefined) {
			  console.log('    🔥 Removing bridge at', aiMove.coinAction.ring, aiMove.coinAction.cell);
			  dispatch(voragoSlice.actions.removeBridge({
				ring: aiMove.coinAction.ring,
				cell: aiMove.coinAction.cell
			  }));
			}
			break;
		  default:
			console.log('    ℹ️ No special action for', aiMove.coinAction.action);
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
	  dispatch(voragoSlice.actions.endTurn());

	} catch (error) {
	  console.error('  ❌ AI turn error:', error);
	  dispatch(voragoSlice.actions.setDisplayMessage('AI error - ending turn'));

	  await new Promise(resolve => setTimeout(resolve, 1500));

	  // End turn anyway to prevent getting stuck
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

	setAIMode: (state, action: PayloadAction<{ enabled: boolean; difficulty?: 'easy' | 'medium' | 'hard' | 'expert' }>) => {
	  state.isAI = action.payload.enabled;
	  if (action.payload.difficulty) {
		state.aiDifficulty = action.payload.difficulty;
	  }
	},

	// Stone movement
	moveStone: (state, action: PayloadAction<{ stone: Stone; toRing: number; toCell: number }>) => {
	  const { stone, toRing, toCell } = action.payload;

	  // If stone was previously placed, remove it from old position
	  if (stone.ring >= 0 && stone.ring < 5 && stone.cell >= 0) {
		const fromKey = `${stone.ring}-${stone.cell}`;
		state.cells[fromKey].stone = null;
	  }

	  // Check if moving to goal (ring 5)
	  if (toRing === 5) {
		// Don't place stone in cells - it goes to goal and disappears from board
		const playerKey = `player${stone.player}` as 'player1' | 'player2';
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
		const playerKey = `player${stone.player}` as 'player1' | 'player2';
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
	  state.selectedCoin = action.payload;
	  state.hasUsedCoin = true;

	  // Add to disabled coins for next round
	  const player = `player${state.turn}` as 'player1' | 'player2';
	  state.disabledCoins[player].push(action.payload);
	},

	spinRing: (state, action: PayloadAction<{ ring: number; direction: 'cw' | 'ccw' }>) => {
	  const { ring, direction } = action.payload;
	  const increment = direction === 'cw' ? 30 : -30; // 30 degrees per cell
	  state.degrees[ring] = (state.degrees[ring] + increment) % 360;
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

	  // Check if cell has a bridge
	  if (state.cells[cellKey]?.hasBridge) {
		state.displayMessage = 'Cannot place wall on a cell with a bridge';
		setTimeout(() => {
		  state.displayMessage = '';
		}, 2000);
		return;
	  }

	  state.cells[cellKey].hasWall = true;
	  state.hasUsedCoin = true;
	},

	removeWall: (state, action: PayloadAction<{ ring: number; cell: number }>) => {
	  const key = `${action.payload.ring}-${action.payload.cell}`;
	  state.cells[key].hasWall = false;
	},

	placeBridge: (state, action: PayloadAction<{ ring: number; cell: number }>) => {
	  const { ring, cell } = action.payload;
	  const cellKey = `${ring}-${cell}`;

	  // Check if cell has a wall
	  if (state.cells[cellKey]?.hasWall) {
		state.displayMessage = 'Cannot place bridge on a cell with a wall';
		setTimeout(() => {
		  state.displayMessage = '';
		}, 2000);
		return;
	  }

	  state.cells[cellKey].hasBridge = true;
	  state.hasUsedCoin = true;
	},

	removeBridge: (state, action: PayloadAction<{ ring: number; cell: number }>) => {
	  const key = `${action.payload.ring}-${action.payload.cell}`;
	  state.cells[key].hasBridge = false;
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

		// Clear disabled coins from last round
		state.disabledCoins.player1 = [];
		state.disabledCoins.player2 = [];
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
	}
  }
});

export const {
  newGame,
  setPlayerNames,
  setAIMode,
  moveStone,
  useCoin,
  spinRing,
  resetRing,
  lockRing,
  unlockRing,
  placeWall,
  removeWall,
  placeBridge,
  removeBridge,
  endTurn,
  setDisplayMessage,
  selectUnplacedStone,
  selectStone
} = voragoSlice.actions;

export default voragoSlice.reducer;