// Vorago game types

export interface Stone {
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
