/**
 * voragoTypes.ts
 *
 * TypeScript type definitions for the Vorago board game.
 *
 * Vorago is a two-player strategy game played on a circular board made of 5
 * concentric rings. Each player has 3 stones and tries to move all of them
 * into the center goal (ring 5). Players can also use "Cardinal Coins" each
 * turn to affect the board — placing walls, spinning rings, etc.
 *
 * These types are imported by the Redux slice (voragoSlice.ts),
 * constants (voragoConstants.ts), AI thunk (voragoAIThunk.ts),
 * and board component (VoragoBoard.tsx).
 */

/**
 * A single game stone belonging to one of the two players.
 *
 * Each player has 3 stones. A stone starts unplaced (ring: -1, cell: -1),
 * gets placed on the outermost ring (ring 0), then moves inward toward the
 * center goal (ring 5). Once scored, it's marked with ring: 99, cell: 99.
 */
export interface Stone {
  player: 1 | 2;
  ring: number;  // -1 = unplaced; 0-4 = board rings (0 is outermost); 5 = goal; 99 = scored
  cell: number;  // -1 = unplaced; 0-based index around the ring
}

/**
 * A single cell on the game board.
 *
 * The board has 5 rings, each subdivided into cells (32, 16, 16, 8, 4 per ring).
 * Cells are identified by "ring-cell" string keys in the Redux state (e.g. "0-7").
 * A cell can contain a wall OR a bridge (not both), and optionally a stone.
 *
 * Walls block stone movement through that cell.
 * Bridges allow stone movement between non-adjacent rings.
 */
export interface Cell {
  ring: number;
  cell: number;
  hasWall: boolean;
  hasBridge: boolean;
  stone: Stone | null;  // null if the cell is unoccupied
}

/**
 * A Cardinal Coin — a special power card that a player can use once per turn.
 *
 * There are 13 coins, each named after a Cardinal (powerful entity in the
 * Atom Magic universe). Each coin belongs to one of three aspects:
 *   - "um" = destructive/controlling powers (Anathema, Mnemonic, etc.)
 *   - "os" = constructive/movement powers (Arcadia, Vertigo, etc.)
 *   - "umos" = balanced/transformative powers (Aura)
 *
 * Once a coin is used, it becomes disabled for that player next round.
 * The Magna coin can additionally disable any coin for BOTH players.
 *
 * The `action` string maps to a Redux action name in voragoSlice.ts.
 * It's also used by the AI (vorago-ai/route.ts) to specify its chosen action.
 */
export interface Coin {
  title: string;       // Cardinal name, e.g. "Vertigo" — used as the unique identifier
  subtitle: string;    // Flavor text, e.g. "The Voice of Discord"
  aspect: 'um' | 'os' | 'umos';
  description: string; // Human-readable explanation of the coin's effect
  action: string;      // Maps to a Redux action or AI action key, e.g. "spinRing"
}

/**
 * The complete Redux state for a Vorago game session.
 *
 * This is the single source of truth for everything in the game — board layout,
 * player info, whose turn it is, coin usage, and UI state. It lives in the
 * Redux store and is managed by voragoSlice.ts.
 *
 * Key concepts:
 * - `cells` is a flat map of every board cell, keyed by "ring-cell" string
 * - `degrees` tracks visual rotation of each ring for the SVG board rendering
 * - `lockedRings` tracks which rings are locked by the Anathema coin
 * - Coin cooldowns work via `coinsUsedThisRound` → `disabledCoins` rotation at end-of-round
 */
export interface VoragoState {
  // ─── Game meta ───────────────────────────────────────────────────────────────

  round: number;          // Increments each time play returns to player 1
  turn: 1 | 2;            // Which player's turn it currently is
  gameWin: boolean;       // True once a player has scored all 3 stones
  winner: 1 | 2 | null;  // The winning player, or null if game is still active

  // ─── Players ─────────────────────────────────────────────────────────────────

  player1Name: string;
  player2Name: string;
  isAI: boolean;          // If true, player 2 is controlled by the AI opponent
  aiDifficulty: 'easy' | 'medium' | 'hard';

  // ─── Score ───────────────────────────────────────────────────────────────────

  // Number of stones each player has scored (moved into the center goal).
  // First to 3 wins.
  score: {
    player1: number;
    player2: number;
  };

  // ─── Board state ─────────────────────────────────────────────────────────────

  // All cells on the board, keyed by "ring-cell" (e.g. "0-7", "3-2").
  // Ring 0 is the outermost; ring 4 is the innermost before the goal.
  cells: Record<string, Cell>;

  // Visual rotation of each ring in degrees. Rings can be spun by the Vertigo
  // coin or reset by the Cadence coin. Used for SVG animation in VoragoBoard.tsx.
  degrees: number[];  // Index matches ring number, e.g. degrees[0] = ring 0 rotation

  // Which rings are currently locked (cannot be spun). Locked by Anathema coin,
  // unlocked by Polyphony coin.
  lockedRings: boolean[];  // Index matches ring number

  // ─── Stones ──────────────────────────────────────────────────────────────────

  stones: {
    player1: Stone[];  // Always 3 stones; ring/cell of -1 means unplaced
    player2: Stone[];
  };

  // ─── Coins ───────────────────────────────────────────────────────────────────

  // The full list of 13 Cardinal Coins available in the game (defined in voragoConstants.ts)
  availableCoins: Coin[];

  // Coins that cannot be used this round (used last round, or Magna-disabled).
  // Populated at the start of each round from coinsUsedThisRound.
  disabledCoins: {
    player1: string[];  // Array of coin title strings, e.g. ["Vertigo", "Anathema"]
    player2: string[];
  };

  // Coins used during the current round. Becomes `disabledCoins` at round end.
  coinsUsedThisRound: {
    player1: string[];
    player2: string[];
  };

  // The coin chosen by the Magna coin to be disabled for BOTH players next round.
  // Applied to both disabledCoins arrays at end of round, then cleared.
  magnaDisabledCoin: string | null;

  // ─── History tracking (for Mnemonic and Charlatan coins) ─────────────────────

  // Records where each player's stone was before and after their last move.
  // Used by the Mnemonic coin to undo an opponent's last stone move.
  lastStoneMove: {
    player1: { from: { ring: number; cell: number } | null; to: { ring: number; cell: number } | null } | null;
    player2: { from: { ring: number; cell: number } | null; to: { ring: number; cell: number } | null } | null;
  };

  // The last coin title used by each player.
  // Used by the Charlatan coin to copy the opponent's last action.
  lastCoinUsed: {
    player1: string | null;
    player2: string | null;
  };

  // ─── Turn state ──────────────────────────────────────────────────────────────

  // Each turn requires both a stone move AND a coin use before it can end.
  hasMovedStone: boolean;
  hasUsedCoin: boolean;

  // Set true if a coin effect freezes the current round (prevents progress).
  // Not currently used by any coin but reserved for future rules.
  frozenRound: boolean;

  // ─── UI state ────────────────────────────────────────────────────────────────

  // The stone currently selected by the active player (for move targeting).
  // Null when no stone is selected.
  selectedStone: Stone | null;

  // The title of the coin currently selected but not yet acted upon.
  // Set by useCoin(), cleared by completeCoinAction() or cancelCoin().
  selectedCoin: string | null;

  // Whether to show the turn-transition dialog between player turns.
  showTurnDialog: boolean;

  // Short status message shown in the game UI (e.g. "Player 1's turn", "AI is thinking...").
  displayMessage: string;

  // True while the AI is computing its turn. Used to show a loading state and
  // prevent player input during the AI's move sequence.
  isAIThinking: boolean;
}
