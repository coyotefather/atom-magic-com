/**
 * voragoConstants.ts
 *
 * Static data and initial state factory functions for the Vorago board game.
 *
 * This file defines:
 *   - RING_CELL_COUNTS: how many cells each of the 5 rings has
 *   - COINS: the 13 Cardinal Coins with their descriptions and action keys
 *   - createCellMap(): builds the flat board cell dictionary used in Redux state
 *   - createInitialStones(): creates a player's starting set of 3 unplaced stones
 *   - initialState: the full starting Redux state for a new game
 *
 * Imported by voragoSlice.ts and voragoAIThunk.ts.
 */

import type { Coin, Cell, VoragoState, Stone } from './voragoTypes';

/**
 * Number of cells in each ring, indexed from outermost (0) to innermost (4).
 *
 * The board is circular with 5 concentric rings:
 *   Ring 0: 32 cells (outermost — where stones are initially placed)
 *   Ring 1: 16 cells
 *   Ring 2: 16 cells
 *   Ring 3:  8 cells
 *   Ring 4:  4 cells (innermost ring before the goal)
 *   Ring 5: the center goal — not a real ring, just a destination
 *
 * The varying cell counts mean different rings have different cell sizes visually.
 * Rotation is calculated as 360 / RING_CELL_COUNTS[ring] degrees per step.
 */
export const RING_CELL_COUNTS = [32, 16, 16, 8, 4] as const;

/**
 * The 13 Cardinal Coins available in the game.
 *
 * Each coin is named after a Cardinal — a powerful entity in the Atom Magic
 * universe. Players use one coin per turn to affect the board state.
 *
 * Coins are grouped by aspect:
 *   "um"   = destructive/controlling (Anathema, Mnemonic, Cadence, Gamma, Magna, Sovereign)
 *   "os"   = constructive/movement (Rubicon, Vertigo, Arcadia, Spectrum, Polyphony, Charlatan)
 *   "umos" = balanced/transformative (Aura)
 *
 * The `action` string is used to:
 *   1. Dispatch the matching Redux action in voragoSlice.ts
 *   2. Tell the AI which action it chose (in vorago-ai/route.ts responses)
 *   3. Identify which component/behavior to invoke in the UI
 *
 * After being used, a coin is added to `coinsUsedThisRound` and becomes
 * disabled for that player on the following round.
 */
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

/**
 * Builds the initial flat cell map for a new game board.
 *
 * Returns a dictionary where each key is "ring-cell" (e.g. "0-7", "3-2")
 * and each value is a Cell object with no walls, bridges, or stones.
 *
 * This format is used throughout the Redux state and game logic because it
 * allows O(1) cell lookup by position (e.g. state.cells["2-5"]) rather
 * than needing to search a nested array.
 *
 * Total cells: 32 + 16 + 16 + 8 + 4 = 76
 */
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

/**
 * Creates a player's starting set of 3 unplaced stones.
 *
 * Unplaced stones have ring: -1 and cell: -1. They must be placed on the
 * outermost ring (ring 0) before they can move inward toward the goal.
 *
 * @param player - 1 or 2, identifying which player owns these stones
 */
export function createInitialStones(player: 1 | 2): Stone[] {
  return [
    { player, ring: -1, cell: -1 },
    { player, ring: -1, cell: -1 },
    { player, ring: -1, cell: -1 }
  ];
}

/**
 * The default Redux state at the start of a new Vorago game.
 *
 * Used as the `initialState` argument in createSlice (voragoSlice.ts).
 * Also used by the `newGame` action to reset state while preserving
 * player names, AI mode, and difficulty settings.
 *
 * Notable defaults:
 * - Player 2 is AI by default (isAI: true)
 * - Difficulty starts at 'medium'
 * - All coins are available (none disabled)
 * - Board is empty (no walls, bridges, or placed stones)
 */
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
