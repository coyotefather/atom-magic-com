/**
 * voragoAIThunk.ts
 *
 * Async Redux thunk that executes the AI opponent's turn in Vorago.
 *
 * When it's player 2's turn and AI mode is enabled, the VoragoBoard component
 * dispatches `executeAITurn`. This thunk:
 *   1. Shows a "thinking" overlay and waits 1 second (for realism)
 *   2. Sends the full game state to the /api/vorago-ai endpoint
 *   3. Receives the AI's chosen stone move and coin action
 *   4. Dispatches the corresponding Redux actions to execute the move
 *   5. Ends the AI's turn
 *
 * The actual AI decision-making logic lives in src/app/api/vorago-ai/route.ts.
 * This file handles the client-side execution of whatever the API decides.
 *
 * Circular dependency workaround:
 *   This thunk needs to dispatch actions from voragoSlice.ts, but voragoSlice.ts
 *   also imports this file (to re-export executeAITurn). To avoid a circular
 *   import, this file does NOT import voragoSlice directly. Instead, it exports
 *   `injectSliceActions()` which voragoSlice calls after creating the slice,
 *   passing its own action creators in at runtime.
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { selectRandomElement, randomDirection } from '../utils/random';
import type { VoragoState } from './voragoTypes';
import { RING_CELL_COUNTS } from './voragoConstants';

/**
 * Holds the action creators injected from voragoSlice after it's created.
 * Starts as null and is populated by `injectSliceActions()` at app init.
 * All dispatches in this file go through this reference.
 */
let sliceActions: {
  setAIThinking: (thinking: boolean) => { type: string; payload: boolean };
  setDisplayMessage: (message: string) => { type: string; payload: string };
  moveStone: (payload: { stone: { player: 1 | 2; ring: number; cell: number }; toRing: number; toCell: number }) => { type: string; payload: unknown };
  useCoin: (coinTitle: string) => { type: string; payload: string };
  spinRing: (payload: { ring: number; direction: 'cw' | 'ccw' }) => { type: string; payload: unknown };
  resetRing: (ring: number) => { type: string; payload: number };
  lockRing: (ring: number) => { type: string; payload: number };
  unlockRing: (ring: number) => { type: string; payload: number };
  placeWall: (payload: { ring: number; cell: number }) => { type: string; payload: unknown };
  removeWall: (payload: { ring: number; cell: number }) => { type: string; payload: unknown };
  placeBridge: (payload: { ring: number; cell: number }) => { type: string; payload: unknown };
  removeBridge: (payload: { ring: number; cell: number }) => { type: string; payload: unknown };
  transformWallBridge: (payload: { ring: number; cell: number }) => { type: string; payload: unknown };
  returnOpponentStone: () => { type: string };
  setMagnaDisabledCoin: (coin: string) => { type: string; payload: string };
  moveWallBridge: (payload: { from: { ring: number; cell: number }; to: { ring: number; cell: number } }) => { type: string; payload: unknown };
  completeCoinAction: () => { type: string };
  endTurn: () => { type: string };
} | null = null;

/**
 * Called by voragoSlice immediately after the slice is created.
 * Passes the slice's action creators into this module so the thunk
 * can dispatch them without a circular import.
 */
export function injectSliceActions(actions: typeof sliceActions) {
  sliceActions = actions;
}

// ─── AI helper functions ────────────────────────────────────────────────────────
// These are used as fallbacks when the API response doesn't specify a target
// (e.g. "spin a ring" but doesn't say which one — pick a random unlocked ring).

/** Returns the index of a random ring that is NOT currently locked. */
function getRandomUnlockedRing(lockedRings: boolean[]): number {
  const unlocked = lockedRings.map((locked, i) => locked ? -1 : i).filter(i => i >= 0);
  return selectRandomElement(unlocked) ?? 0;
}

/** Returns the index of a random ring that IS currently locked, or null if none are locked. */
function getRandomLockedRing(lockedRings: boolean[]): number | null {
  const locked = lockedRings.map((isLocked, i) => isLocked ? i : -1).filter(i => i >= 0);
  return selectRandomElement(locked) ?? null;
}

/**
 * Returns a random cell that has no wall, bridge, or stone.
 * Used as a fallback target for coins that need an empty cell (Sovereign, Arcadia).
 */
function getRandomEmptyCell(cells: VoragoState['cells']): { ring: number; cell: number } | null {
  const emptyCells: { ring: number; cell: number }[] = [];
  Object.values(cells).forEach(cell => {
    if (!cell.hasWall && !cell.hasBridge && !cell.stone) {
      emptyCells.push({ ring: cell.ring, cell: cell.cell });
    }
  });
  return selectRandomElement(emptyCells) ?? null;
}

// ─── Response type from /api/vorago-ai ─────────────────────────────────────────

/**
 * The shape of the JSON response from the AI endpoint (/api/vorago-ai).
 * Both fields are optional — the AI may skip either action if nothing makes sense.
 */
interface AIMoveResponse {
  stoneMove?: {
    stone: { player: 1 | 2; ring: number; cell: number };
    toRing: number;
    toCell: number;
  };
  coinAction?: {
    coinTitle: string;  // The Cardinal Coin being used (e.g. "Vertigo")
    action: string;     // The action key matching a Redux action (e.g. "spinRing")
    ring?: number;      // Target ring (if applicable)
    cell?: number;      // Target cell (if applicable)
    direction?: 'cw' | 'ccw';  // Spin direction (for Vertigo / Cadence)
    targetCoin?: string;        // Coin to disable (for Magna)
    fromRing?: number;          // Source ring (for Spectrum's move)
    fromCell?: number;          // Source cell (for Spectrum's move)
  };
}

// ─── Main AI turn thunk ────────────────────────────────────────────────────────

/**
 * The async thunk that runs the full AI turn sequence.
 *
 * Dispatched by VoragoBoard.tsx when:
 *   - isAI is true
 *   - turn === 2 (player 2's turn)
 *   - gameWin is false
 *
 * On error (network failure, API error), ends the turn anyway rather than
 * leaving the game stuck — shows an error message briefly first.
 */
export const executeAITurn = createAsyncThunk(
  'vorago/executeAITurn',
  async (_, { getState, dispatch }) => {
    if (!sliceActions) {
      throw new Error('Slice actions not injected - call injectSliceActions first');
    }

    const state = getState() as { vorago: VoragoState };
    const { isAI, aiDifficulty, turn } = state.vorago;

    // Safety check — only run if it's actually the AI's turn
    if (!isAI || turn !== 2) {
      return;
    }

    dispatch(sliceActions.setAIThinking(true));
    dispatch(sliceActions.setDisplayMessage('AI is thinking...'));

    // Brief pause for a more natural feel before the AI "acts"
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Send the full game state to the AI decision endpoint.
      // The API returns a chosen stone move and coin action based on difficulty.
      const response = await fetch('/api/vorago-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameState: state.vorago,
          difficulty: aiDifficulty
        })
      });

      if (!response.ok) {
        throw new Error('AI request failed');
      }

      const aiMove: AIMoveResponse = await response.json();

      // Execute the AI's stone move first
      if (aiMove.stoneMove) {
        dispatch(sliceActions.moveStone({
          stone: aiMove.stoneMove.stone,
          toRing: aiMove.stoneMove.toRing,
          toCell: aiMove.stoneMove.toCell
        }));
      }

      // Small pause between the stone move and the coin action for readability
      await new Promise(resolve => setTimeout(resolve, 500));

      // Execute the AI's chosen coin
      if (aiMove.coinAction) {
        dispatch(sliceActions.useCoin(aiMove.coinAction.coinTitle));

        await new Promise(resolve => setTimeout(resolve, 300));

        // Re-read state for current board conditions (needed for fallback targeting)
        const currentState = (getState() as { vorago: VoragoState }).vorago;
        const { lockedRings, cells } = currentState;

        executeCoinAction(dispatch, aiMove.coinAction, lockedRings, cells);
      }

      dispatch(sliceActions.setDisplayMessage('AI turn complete'));

      // Give the player a moment to see what the AI did before handing back control
      await new Promise(resolve => setTimeout(resolve, 1000));

      dispatch(sliceActions.setAIThinking(false));
      dispatch(sliceActions.endTurn());

    } catch (error) {
      console.error('Vorago AI turn error:', error);
      dispatch(sliceActions.setDisplayMessage('AI error - ending turn'));

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Always end the turn even on failure — don't leave the game stuck
      dispatch(sliceActions.setAIThinking(false));
      dispatch(sliceActions.endTurn());
    }
  }
);

// ─── Coin execution ────────────────────────────────────────────────────────────

/**
 * Dispatches the Redux actions needed to execute a specific coin's effect.
 *
 * Each case matches a coin `action` string from the API response and
 * dispatches the appropriate Redux action(s).
 *
 * Fallback behavior: if the API didn't specify a target (e.g. no `ring` provided
 * for a "lockRing" action), we pick a sensible random target using the helper
 * functions above. This ensures the AI never gets stuck due to a partial response.
 *
 * Every case ends by calling completeCoinAction(), which records the coin use
 * in coinsUsedThisRound and sets hasUsedCoin = true.
 *
 * @param dispatch - Redux dispatch function from the thunk
 * @param coinAction - The coin action descriptor returned by the AI API
 * @param lockedRings - Current ring lock state (for fallback ring selection)
 * @param cells - Current board cells (for fallback cell selection)
 */
function executeCoinAction(
  dispatch: (action: unknown) => void,
  coinAction: NonNullable<AIMoveResponse['coinAction']>,
  lockedRings: boolean[],
  cells: VoragoState['cells']
) {
  if (!sliceActions) return;

  switch (coinAction.action) {
    case 'spinRing': {
      // Vertigo: spin a ring one step in a direction
      const ring = coinAction.ring ?? getRandomUnlockedRing(lockedRings);
      const direction = coinAction.direction ?? randomDirection();
      dispatch(sliceActions.spinRing({ ring, direction }));
      dispatch(sliceActions.completeCoinAction());
      break;
    }
    case 'resetRing': {
      // Cadence: snap a ring back to 0° rotation
      const ring = coinAction.ring ?? getRandomUnlockedRing(lockedRings);
      dispatch(sliceActions.resetRing(ring));
      dispatch(sliceActions.completeCoinAction());
      break;
    }
    case 'lockRing': {
      // Anathema: lock a ring so it can't be spun
      const ring = coinAction.ring ?? getRandomUnlockedRing(lockedRings);
      dispatch(sliceActions.lockRing(ring));
      dispatch(sliceActions.completeCoinAction());
      break;
    }
    case 'unlockRing': {
      // Polyphony: unlock a previously locked ring
      const ring = coinAction.ring ?? getRandomLockedRing(lockedRings);
      if (ring !== null) {
        dispatch(sliceActions.unlockRing(ring));
      }
      dispatch(sliceActions.completeCoinAction());
      break;
    }
    case 'placeWall': {
      // Sovereign: add a wall to an empty cell
      const target = (coinAction.ring !== undefined && coinAction.cell !== undefined)
        ? { ring: coinAction.ring, cell: coinAction.cell }
        : getRandomEmptyCell(cells);
      if (target) {
        dispatch(sliceActions.placeWall(target));
      }
      dispatch(sliceActions.completeCoinAction());
      break;
    }
    case 'removeWall': {
      // Rubicon: remove an existing wall
      const wallCells = Object.values(cells).filter(c => c.hasWall);
      const target = (coinAction.ring !== undefined && coinAction.cell !== undefined)
        ? { ring: coinAction.ring, cell: coinAction.cell }
        : selectRandomElement(wallCells) ?? null;
      if (target) {
        dispatch(sliceActions.removeWall({ ring: target.ring, cell: target.cell }));
      }
      dispatch(sliceActions.completeCoinAction());
      break;
    }
    case 'placeBridge': {
      // Arcadia: add a bridge to an empty cell
      const target = (coinAction.ring !== undefined && coinAction.cell !== undefined)
        ? { ring: coinAction.ring, cell: coinAction.cell }
        : getRandomEmptyCell(cells);
      if (target) {
        dispatch(sliceActions.placeBridge(target));
      }
      dispatch(sliceActions.completeCoinAction());
      break;
    }
    case 'removeBridge': {
      // Gamma: remove an existing bridge
      const bridgeCells = Object.values(cells).filter(c => c.hasBridge);
      const target = (coinAction.ring !== undefined && coinAction.cell !== undefined)
        ? { ring: coinAction.ring, cell: coinAction.cell }
        : selectRandomElement(bridgeCells) ?? null;
      if (target) {
        dispatch(sliceActions.removeBridge({ ring: target.ring, cell: target.cell }));
      }
      dispatch(sliceActions.completeCoinAction());
      break;
    }
    case 'transformWallBridge': {
      // Aura: flip a wall to a bridge or a bridge to a wall
      const wallBridgeCells = Object.values(cells).filter(c => c.hasWall || c.hasBridge);
      const target = (coinAction.ring !== undefined && coinAction.cell !== undefined)
        ? { ring: coinAction.ring, cell: coinAction.cell }
        : selectRandomElement(wallBridgeCells) ?? null;
      if (target) {
        dispatch(sliceActions.transformWallBridge({ ring: target.ring, cell: target.cell }));
      }
      dispatch(sliceActions.completeCoinAction());
      break;
    }
    case 'returnOpponentStone': {
      // Mnemonic: undo the human player's last stone move
      dispatch(sliceActions.returnOpponentStone());
      dispatch(sliceActions.completeCoinAction());
      break;
    }
    case 'disableCoin': {
      // Magna: block a specific coin for both players next round
      const targetCoin = coinAction.targetCoin ?? 'Vertigo';
      dispatch(sliceActions.setMagnaDisabledCoin(targetCoin));
      dispatch(sliceActions.completeCoinAction());
      break;
    }
    case 'moveWallBridge': {
      // Spectrum: move a wall or bridge one cell to the right (within the same ring)
      const wallBridgeCells = Object.values(cells).filter(c => c.hasWall || c.hasBridge);
      if (wallBridgeCells.length > 0) {
        const source = (coinAction.fromRing !== undefined && coinAction.fromCell !== undefined)
          ? { ring: coinAction.fromRing, cell: coinAction.fromCell }
          : selectRandomElement(wallBridgeCells)!;
        // Move one cell clockwise within the same ring (wraps around)
        const destCell = (source.cell + 1) % RING_CELL_COUNTS[source.ring];
        dispatch(sliceActions.moveWallBridge({
          from: { ring: source.ring, cell: source.cell },
          to: { ring: source.ring, cell: destCell }
        }));
      }
      dispatch(sliceActions.completeCoinAction());
      break;
    }
    case 'copyOpponentCoin': {
      // Charlatan: use the same coin the human player last used.
      // Full implementation would re-execute the human's last coin action here.
      // Currently simplified to just complete without additional effect.
      dispatch(sliceActions.completeCoinAction());
      break;
    }
    default:
      // Unknown action — complete the coin use gracefully so the turn can end
      dispatch(sliceActions.completeCoinAction());
  }
}
