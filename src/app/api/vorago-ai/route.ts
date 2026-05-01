/**
 * vorago-ai/route.ts
 *
 * API route that generates the AI opponent's move in the Vorago board game.
 *
 * Why this is an API route (not client-side code):
 *   The AI decision logic runs on the server to prevent the player from inspecting
 *   it via browser dev tools. In the future, this route could be upgraded to use
 *   an actual LLM for more sophisticated play — the API boundary makes that swap
 *   easy without changing any client code.
 *
 * How the AI works:
 *   The AI always makes two choices each turn: a stone move and a coin action.
 *   The current implementation uses simple heuristics (not real game AI):
 *
 *   Stone move strategy:
 *     1. If any AI stone is unplaced (ring: -1), place it on the outermost ring (ring 0).
 *     2. Otherwise, try to move a stone one ring inward (toward the center).
 *     3. If inward movement is blocked, try moving laterally within the same ring.
 *
 *   Coin action strategy:
 *     1. Filter out coins on cooldown (`disabledCoins.player2`).
 *     2. Filter out coins that aren't applicable to the current board state
 *        (e.g., "Rubicon: removeWall" is useless if there are no walls).
 *     3. Pick a random coin from the remaining applicable coins.
 *     4. Generate valid parameters for that coin's action (random target ring, cell, etc.).
 *
 *   The `difficulty` parameter is currently accepted but not implemented — all
 *   difficulty levels use the same random heuristic. Future versions could use
 *   difficulty to adjust aggressiveness, lookahead depth, or coin targeting logic.
 *
 * Vorago game concepts (needed to understand this file):
 *   - The board has 5 rings (0 = outermost / 4 = innermost) plus a center goal (ring 5)
 *   - Ring sizes: 12, 10, 8, 6, 4 cells (outermost to innermost)
 *   - Each player has 3 stones; goal is to move all 3 to ring 4 (adjacent to center)
 *   - Unplaced stones have ring: -1
 *   - 13 Cardinal Coins with unique actions (spin, lock, place walls/bridges, etc.)
 *   - Coins go on cooldown after use (tracked in `disabledCoins`)
 *   - `degrees[i]` is how many degrees ring i has been rotated from its starting position
 *   - `lockedRings[i]` prevents ring i from being spun
 *
 * Request body:
 *   ```json
 *   {
 *     "gameState": { ... },   // Current VoragoState (see voragoTypes.ts for shape)
 *     "difficulty": "medium"  // "easy" | "medium" | "hard" | "expert"
 *   }
 *   ```
 *
 * Response:
 *   ```json
 *   {
 *     "stoneMove": { "stone": {...}, "toRing": 1, "toCell": 3 } | null,
 *     "coinAction": { "coinTitle": "Gamma", "action": "removeBridge", "ring": 2, "cell": 5 } | null
 *   }
 *   ```
 *
 * Called by:
 *   - `src/lib/slices/voragoAIThunk.ts` — dispatched during the AI's turn
 */

import { NextRequest, NextResponse } from 'next/server';
import { selectRandomElement, randomDirection } from '@/lib/utils/random';

// ─── Type definitions ──────────────────────────────────────────────────────────
// These mirror a subset of the types in voragoTypes.ts. They are redefined here
// because this file runs on the server and shouldn't import client-side Redux types.

interface Stone {
  player: 1 | 2;
  ring: number;  // -1 if unplaced; 0-4 if on board; 99 if scored
  cell: number;  // -1 if unplaced; cell index within the ring
}

interface Cell {
  ring: number;
  cell: number;
  hasWall: boolean;
  hasBridge: boolean;
  stone: Stone | null;
}

interface StoneMove {
  stone: Stone;
  toRing: number;
  toCell: number;
}

interface CoinAction {
  coinTitle: string;
  action: string;
  ring?: number;
  cell?: number;
  direction?: 'cw' | 'ccw';
  targetCoin?: string;
  fromRing?: number;
  fromCell?: number;
  toRing?: number;
  toCell?: number;
  copiedCoin?: string;
}

/**
 * Subset of VoragoState passed in from the client.
 * Only the fields the AI needs for decision-making are included.
 */
interface GameState {
  /** Flat dictionary of all board cells, keyed as "ring-cell" (e.g., "0-3"). */
  cells: Record<string, Cell>;
  stones: {
	player1: Stone[];
	player2: Stone[];  // The AI plays as player 2
  };
  /** Coins currently on cooldown (unavailable this turn) for each player. */
  disabledCoins: {
	player1: string[];
	player2: string[];
  };
  /** All coins that exist in the game with their action type. */
  availableCoins: Array<{
	title: string;
	action: string;
  }>;
  /** How many degrees each ring has been rotated from its initial position. */
  degrees: number[];
  /** Whether each ring is locked (locked rings can't be spun). */
  lockedRings: boolean[];
  /** Current round number (1-indexed). Round 1 has limited history for some coins. */
  round: number;
  /** The last stone move made by each player (used by Mnemonic coin). */
  lastStoneMove: {
	player1: { from: { ring: number; cell: number } | null; to: { ring: number; cell: number } | null } | null;
	player2: { from: { ring: number; cell: number } | null; to: { ring: number; cell: number } | null } | null;
  };
  /** The last coin used by each player (used by Charlatan coin). */
  lastCoinUsed: {
	player1: string | null;
	player2: string | null;
  };
  /** Coin disabled by Magna coin (cannot be copied by Charlatan). */
  magnaDisabledCoin: string | null;
}

/** Valid AI difficulty levels. The difficulty parameter is accepted but not yet implemented. */
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'] as const;
type Difficulty = typeof VALID_DIFFICULTIES[number];

// ─── POST handler ───────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
	const body = await request.json();

	if (!body.gameState) {
	  return NextResponse.json(
		{ error: 'Missing gameState in request body' },
		{ status: 400 }
	  );
	}

	const { gameState, difficulty = 'medium' } = body;

	if (!VALID_DIFFICULTIES.includes(difficulty as Difficulty)) {
	  return NextResponse.json(
		{ error: 'Invalid difficulty level' },
		{ status: 400 }
	  );
	}

	// Validate required shape of game state before using it
	if (!gameState.stones || !gameState.cells || !gameState.availableCoins) {
	  return NextResponse.json(
		{ error: 'Invalid gameState: missing required properties' },
		{ status: 400 }
	  );
	}

	if (typeof gameState.stones !== 'object' ||
		typeof gameState.cells !== 'object' ||
		!Array.isArray(gameState.availableCoins)) {
	  return NextResponse.json(
		{ error: 'Invalid gameState: incorrect property types' },
		{ status: 400 }
	  );
	}

	const aiMove = makeAIMove(gameState, difficulty as Difficulty);

	if (!aiMove.stoneMove && !aiMove.coinAction) {
	  return NextResponse.json(
		{ error: 'AI could not determine a valid move', stoneMove: null, coinAction: null },
		{ status: 200 }
	  );
	}

	return NextResponse.json(aiMove);
  } catch (error) {
	// Log full details server-side but return a generic message to the client
	// to avoid leaking internal implementation details.
	console.error('Vorago AI Error:', error instanceof Error ? error.message : 'Unknown error');

	return NextResponse.json(
	  { error: 'AI failed to process turn' },
	  { status: 500 }
	);
  }
}

// ─── AI decision functions ─────────────────────────────────────────────────────

/**
 * Top-level AI decision: choose a stone move and a coin action for this turn.
 * The `_difficulty` parameter is reserved for future use — harder difficulties
 * will use smarter heuristics rather than pure random selection.
 */
function makeAIMove(gameState: GameState, _difficulty: Difficulty) {
  const stoneMove = chooseStoneMove(gameState);
  const coinAction = chooseCoinAction(gameState);

  return {
	stoneMove,
	coinAction
  };
}

/**
 * Chooses which stone to move and where.
 *
 * Priority order:
 *   1. Place an unplaced stone on the outermost ring (ring 0), if possible.
 *   2. Move an already-placed stone one ring inward (toward the center).
 *   3. If inward is blocked, move laterally (one cell clockwise in the same ring).
 *   4. If nothing is possible, return null (the AI skips its stone move).
 *
 * Stones at ring 4 (the innermost playable ring) are skipped — they're already
 * in position to score and can't move inward further until scoring happens.
 */
function chooseStoneMove(gameState: GameState): StoneMove | null {
  const aiStones = gameState.stones.player2;

  // Step 1: Place unplaced stones (ring === -1 means unplaced)
  const unplacedStones = aiStones.filter(s => s.ring === -1);
  if (unplacedStones.length > 0) {
	const targetRing = 0;
	const targetCell = findEmptyCell(gameState, targetRing);

	if (targetCell !== -1) {
	  return {
		stone: unplacedStones[0],
		toRing: targetRing,
		toCell: targetCell
	  };
	}
  }

  // Step 2: Move placed stones inward (toward center, ring 0 → ring 4)
  const placedStones = aiStones.filter(s => s.ring >= 0);

  for (const stone of placedStones) {
	if (stone.ring === 4) continue;  // Already at innermost; can't go further

	const targetRing = stone.ring + 1;
	const targetCell = findEmptyCell(gameState, targetRing);

	if (targetCell !== -1) {
	  return {
		stone: stone,
		toRing: targetRing,
		toCell: targetCell
	  };
	}
  }

  // Step 3: Lateral movement within the same ring when inward is blocked
  for (const stone of placedStones) {
	if (stone.ring === 4) continue;

	const adjacentCell = (stone.cell + 1) % getRingSize(stone.ring);
	const cellKey = `${stone.ring}-${adjacentCell}`;

	if (!gameState.cells[cellKey]?.stone) {
	  return {
		stone: stone,
		toRing: stone.ring,
		toCell: adjacentCell
	  };
	}
  }

  return null;
}

/**
 * Determines which coins are currently not applicable given the board state.
 *
 * Some coins require specific board conditions to be useful (e.g., Rubicon needs
 * a wall to exist before it can remove one). Using them when conditions aren't met
 * would be a wasted turn. This function returns the set of coin names the AI
 * should exclude from its random selection.
 *
 * Each Cardinal's inapplicability condition:
 *   - Aura (transformWallBridge): needs at least one wall or bridge on the board
 *   - Mnemonic (returnOpponentStone): needs opponent to have moved a stone, and their
 *     previous position must be vacant (so the stone can return there)
 *   - Cadence (resetRing): needs at least one unlocked ring to have been rotated
 *   - Anathema (lockRing): needs at least one unlocked ring to lock
 *   - Gamma (removeBridge): needs at least one bridge on the board
 *   - Rubicon (removeWall): needs at least one wall on the board
 *   - Vertigo (spinRing): needs at least one unlocked ring to spin
 *   - Polyphony (unlockRing): needs at least one locked ring to unlock
 *   - Spectrum (moveWallBridge): needs at least one wall or bridge to move
 *   - Charlatan (copyOpponentCoin): needs an opponent coin from last round that isn't
 *     Charlatan itself, not disabled by Magna, and not on AI's own cooldown
 */
function getInapplicableCoins(gameState: GameState): Set<string> {
  const inapplicable = new Set<string>();

  // Precompute board state queries used by multiple coin checks
  const hasWalls = Object.values(gameState.cells).some(cell => cell.hasWall);
  const hasBridges = Object.values(gameState.cells).some(cell => cell.hasBridge);
  const hasWallsOrBridges = hasWalls || hasBridges;
  const allRingsLocked = gameState.lockedRings.every(locked => locked);
  const anyRingLocked = gameState.lockedRings.some(locked => locked);
  const anyUnlockedRingRotated = gameState.degrees.some((deg, i) => !gameState.lockedRings[i] && deg !== 0);

  if (!hasWallsOrBridges) {
    inapplicable.add('Aura');
  }

  // Mnemonic: can only reverse the opponent's last move if they've moved and
  // the origin cell is currently empty (otherwise the stone has nowhere to go)
  const opponentLastMove = gameState.lastStoneMove?.player1;
  if (!opponentLastMove || !opponentLastMove.to) {
    inapplicable.add('Mnemonic');
  } else if (opponentLastMove.from) {
    const fromKey = `${opponentLastMove.from.ring}-${opponentLastMove.from.cell}`;
    if (gameState.cells[fromKey]?.stone) {
      inapplicable.add('Mnemonic');
    }
  }

  if (!anyUnlockedRingRotated) {
    inapplicable.add('Cadence');
  }

  if (allRingsLocked) {
    inapplicable.add('Anathema');
  }

  if (!hasBridges) {
    inapplicable.add('Gamma');
  }

  if (!hasWalls) {
    inapplicable.add('Rubicon');
  }

  if (allRingsLocked) {
    inapplicable.add('Vertigo');
  }

  if (!anyRingLocked) {
    inapplicable.add('Polyphony');
  }

  if (!hasWallsOrBridges) {
    inapplicable.add('Spectrum');
  }

  // Charlatan: disabled if there's no valid opponent coin to copy
  const opponentLastCoin = gameState.lastCoinUsed?.player1;
  const aiDisabledCoins = gameState.disabledCoins?.player2 || [];
  if (gameState.round === 1 || !opponentLastCoin) {
    inapplicable.add('Charlatan');  // No history in round 1
  } else if (opponentLastCoin === 'Charlatan') {
    inapplicable.add('Charlatan');  // Can't copy Charlatan (infinite loop prevention)
  } else if (gameState.magnaDisabledCoin === opponentLastCoin) {
    inapplicable.add('Charlatan');  // Target coin disabled by Magna
  } else if (aiDisabledCoins.includes(opponentLastCoin)) {
    inapplicable.add('Charlatan');  // Target coin is on the AI's own cooldown
  }

  return inapplicable;
}

/**
 * Selects a random applicable coin and generates the parameters for its action.
 *
 * For each coin action type, generates the minimal required parameters:
 *   - `spinRing` / `resetRing` / `lockRing` / `unlockRing` — need a ring index
 *   - `placeWall` / `placeBridge` — need a ring and cell index
 *   - `removeWall` / `removeBridge` / `transformWallBridge` / `moveWallBridge` — need a target cell
 *   - `disableCoin` — needs a target coin name
 *   - `copyOpponentCoin` — needs the opponent's last coin name
 *   - `returnOpponentStone` — no extra parameters needed
 *
 * Returns null if no coins are available (all on cooldown or inapplicable).
 */
function chooseCoinAction(gameState: GameState): CoinAction | null {
  const inapplicableCoins = getInapplicableCoins(gameState);

  // Filter out coins on cooldown AND inapplicable coins
  const availableCoins = gameState.availableCoins.filter(
	coin => !gameState.disabledCoins.player2.includes(coin.title) &&
			!inapplicableCoins.has(coin.title)
  );

  if (availableCoins.length === 0) {
	return null;
  }

  const coin = selectRandomElement(availableCoins);
  if (!coin) return null;

  const coinAction: CoinAction = {
	coinTitle: coin.title,
	action: coin.action
  };

  switch (coin.action) {
	case 'spinRing': {
	  // Vertigo: spin any unlocked ring in a random direction
	  const unlockedRings = gameState.degrees
		.map((_, idx) => idx)
		.filter(idx => !gameState.lockedRings[idx]);

	  const selectedRing = selectRandomElement(unlockedRings);
	  if (selectedRing !== undefined) {
		coinAction.ring = selectedRing;
		coinAction.direction = randomDirection();
	  }
	  break;
	}

	case 'resetRing': {
	  // Cadence: reset a rotated ring back to its original position
	  const rotatedRings = gameState.degrees
		.map((deg, idx) => ({ idx, deg }))
		.filter(r => r.deg !== 0 && !gameState.lockedRings[r.idx]);

	  const selected = selectRandomElement(rotatedRings);
	  if (selected) {
		coinAction.ring = selected.idx;
	  }
	  break;
	}

	case 'lockRing': {
	  // Anathema: lock a random currently-unlocked ring
	  const unlocked = gameState.lockedRings
		.map((locked, idx) => locked ? -1 : idx)
		.filter(idx => idx >= 0);
	  const selectedUnlocked = selectRandomElement(unlocked);
	  if (selectedUnlocked !== undefined && selectedUnlocked >= 0) {
		coinAction.ring = selectedUnlocked;
	  }
	  break;
	}

	case 'unlockRing': {
	  // Polyphony: unlock a random currently-locked ring
	  const locked = gameState.lockedRings
		.map((isLocked, idx) => isLocked ? idx : -1)
		.filter(idx => idx >= 0);
	  const selectedLocked = selectRandomElement(locked);
	  if (selectedLocked !== undefined && selectedLocked >= 0) {
		coinAction.ring = selectedLocked;
	  }
	  break;
	}

	case 'placeWall':
	case 'placeBridge': {
	  // Sovereign (wall) / Arcadia (bridge): place on a random empty cell
	  const emptyCells = Object.values(gameState.cells)
		.filter(cell => !cell.hasWall && !cell.hasBridge && !cell.stone)
		.map(cell => ({ ring: cell.ring, cell: cell.cell }));
	  const target = selectRandomElement(emptyCells);
	  if (target) {
		coinAction.ring = target.ring;
		coinAction.cell = target.cell;
	  }
	  break;
	}

	case 'removeWall': {
	  // Rubicon: remove a random existing wall
	  const wallCells = Object.values(gameState.cells).filter(c => c.hasWall);
	  const target = selectRandomElement(wallCells);
	  if (target) {
		coinAction.ring = target.ring;
		coinAction.cell = target.cell;
	  }
	  break;
	}

	case 'removeBridge': {
	  // Gamma: remove a random existing bridge
	  const bridgeCells = Object.values(gameState.cells).filter(c => c.hasBridge);
	  const target = selectRandomElement(bridgeCells);
	  if (target) {
		coinAction.ring = target.ring;
		coinAction.cell = target.cell;
	  }
	  break;
	}

	case 'transformWallBridge': {
	  // Aura: flip a random wall to bridge (or bridge to wall)
	  const wallBridgeCells = Object.values(gameState.cells).filter(c => c.hasWall || c.hasBridge);
	  const target = selectRandomElement(wallBridgeCells);
	  if (target) {
		coinAction.ring = target.ring;
		coinAction.cell = target.cell;
	  }
	  break;
	}

	case 'returnOpponentStone': {
	  // Mnemonic: no parameters needed — the thunk handles moving the stone
	  break;
	}

	case 'disableCoin': {
	  // Magna: randomly disable one of the opponent's available coins for a round
	  const allCoins = gameState.availableCoins.map(c => c.title);
	  const randomCoin = selectRandomElement(allCoins);
	  if (randomCoin) {
		coinAction.targetCoin = randomCoin;
	  }
	  break;
	}

	case 'moveWallBridge': {
	  // Spectrum: move a wall or bridge to an adjacent cell
	  // Simplified: always moves one cell clockwise within the same ring
	  const wallBridgeCells = Object.values(gameState.cells).filter(c => c.hasWall || c.hasBridge);
	  const source = selectRandomElement(wallBridgeCells);
	  if (source) {
		coinAction.fromRing = source.ring;
		coinAction.fromCell = source.cell;
		const destCell = (source.cell + 1) % getRingSize(source.ring);
		coinAction.toRing = source.ring;
		coinAction.toCell = destCell;
	  }
	  break;
	}

	case 'copyOpponentCoin': {
	  // Charlatan: execute the same coin action the opponent used last round
	  const opponentCoin = gameState.lastCoinUsed?.player1;
	  if (opponentCoin) {
		coinAction.copiedCoin = opponentCoin;
	  }
	  break;
	}
  }

  return coinAction;
}

// ─── Board helpers ─────────────────────────────────────────────────────────────

/**
 * Finds the first empty, unobstructed cell in the given ring.
 * A cell is eligible if it exists in the cells map, has no stone on it,
 * and has no wall blocking movement into it.
 *
 * @returns The cell index of the first available cell, or -1 if the ring is full.
 */
function findEmptyCell(gameState: GameState, ring: number): number {
  const ringSize = getRingSize(ring);

  for (let cell = 0; cell < ringSize; cell++) {
	const cellKey = `${ring}-${cell}`;
	const cellData = gameState.cells[cellKey];

	if (cellData && !cellData.stone && !cellData.hasWall) {
	  return cell;
	}
  }

  return -1;
}

/**
 * Returns the number of cells in the given ring.
 *
 * Ring layout (outermost to innermost):
 *   Ring 0: 12 cells
 *   Ring 1: 10 cells
 *   Ring 2: 8 cells
 *   Ring 3: 6 cells
 *   Ring 4: 4 cells (innermost playable ring)
 *
 * Note: The cell counts here differ from the values in voragoConstants.ts
 * (which uses [32, 16, 16, 8, 4]). This file uses a simplified board layout.
 * If the board is redesigned, update both files.
 */
function getRingSize(ring: number): number {
  const sizes = [12, 10, 8, 6, 4];
  return sizes[ring] || 4;
}
