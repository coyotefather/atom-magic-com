// Vorago game constants

import type { Coin, Cell, VoragoState, Stone } from './voragoTypes';

// Ring cell counts for each ring (0-4)
export const RING_CELL_COUNTS = [32, 16, 16, 8, 4] as const;

export const COINS: Coin[] = [
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
export function createCellMap(): Record<string, Cell> {
  const cells: Record<string, Cell> = {};

  RING_CELL_COUNTS.forEach((count, ringIndex) => {
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

// Create initial unplaced stones for a player
export function createInitialStones(player: 1 | 2): Stone[] {
  return [
	{ player, ring: -1, cell: -1 },
	{ player, ring: -1, cell: -1 },
	{ player, ring: -1, cell: -1 }
  ];
}

export const initialState: VoragoState = {
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
	player1: createInitialStones(1),
	player2: createInitialStones(2)
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
