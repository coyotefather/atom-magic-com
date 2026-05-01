/**
 * voragoSlice.ts
 *
 * Redux Toolkit slice managing all state for the Vorago board game.
 *
 * This is the central file for Vorago game logic. It defines every action
 * (Redux reducer) that can change the game state — stone movement, coin use,
 * ring manipulation, and turn management.
 *
 * How it fits together:
 *   - voragoTypes.ts     defines the TypeScript shapes (Stone, Cell, VoragoState, etc.)
 *   - voragoConstants.ts defines COINS, cell counts, and the initial state
 *   - voragoAIThunk.ts   defines the async AI turn (imported + re-exported here)
 *   - VoragoBoard.tsx    renders the board using state from this slice
 *   - CoinSelector.tsx   dispatches useCoin / completeCoinAction / cancelCoin
 *
 * Circular dependency note:
 *   The AI thunk (voragoAIThunk.ts) needs to dispatch actions from this slice,
 *   but this slice also imports the thunk. To break the cycle, the thunk exports
 *   an `injectSliceActions()` function that this slice calls after creation,
 *   passing its own actions to the thunk at runtime rather than import time.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { Stone, VoragoState } from './voragoTypes';
import { COINS, createCellMap, createInitialStones, initialState, RING_CELL_COUNTS } from './voragoConstants';
import { executeAITurn, injectSliceActions } from './voragoAIThunk';

// Re-export types and constants so consumers only need to import from this file
export type { Stone, Cell, Coin, VoragoState } from './voragoTypes';
export { COINS, RING_CELL_COUNTS } from './voragoConstants';

const voragoSlice = createSlice({
  name: 'vorago',
  initialState,
  reducers: {

    // ─── Game setup ────────────────────────────────────────────────────────────

    /**
     * Resets the game to a fresh state while preserving player names,
     * AI mode, and difficulty. Used when starting a new game after one ends.
     */
    newGame: (state) => {
      const cellMap = createCellMap();

      Object.assign(state, {
        ...initialState,
        cells: cellMap,
        stones: {
          player1: createInitialStones(1),
          player2: createInitialStones(2)
        },
        // Preserve settings that the user configured before starting
        player1Name: state.player1Name,
        player2Name: state.player2Name,
        isAI: state.isAI,
        aiDifficulty: state.aiDifficulty
      });
    },

    /** Sets the display names shown for each player in the UI. */
    setPlayerNames: (state, action: PayloadAction<{ player1: string; player2: string }>) => {
      state.player1Name = action.payload.player1;
      state.player2Name = action.payload.player2;
    },

    /**
     * Toggles AI mode for player 2 and optionally sets difficulty.
     * When AI is enabled, player 2's turn is handled by executeAITurn (voragoAIThunk.ts).
     */
    setAIMode: (state, action: PayloadAction<{ enabled: boolean; difficulty?: 'easy' | 'medium' | 'hard' }>) => {
      state.isAI = action.payload.enabled;
      if (action.payload.difficulty) {
        state.aiDifficulty = action.payload.difficulty;
      }
    },

    // ─── Stone movement ────────────────────────────────────────────────────────

    /**
     * Moves a stone from its current position to a new ring and cell.
     *
     * Handles three scenarios:
     *   1. Placing a stone for the first time (from the unplaced tray onto ring 0)
     *   2. Moving a stone inward to a closer ring/cell
     *   3. Moving a stone to the goal (ring 5) — scores the stone and checks win
     *
     * Also records the move in `lastStoneMove` so the Mnemonic coin can undo it.
     * Scored stones are marked with ring: 99, cell: 99 (a sentinel value).
     */
    moveStone: (state, action: PayloadAction<{ stone: Stone; toRing: number; toCell: number }>) => {
      const { stone, toRing, toCell } = action.payload;
      const playerKey = `player${stone.player}` as 'player1' | 'player2';

      // Record the move for potential Mnemonic reversal.
      // Only record a "from" position if the stone was already on the board (not unplaced).
      const fromPos = (stone.ring >= 0 && stone.ring < 5)
        ? { ring: stone.ring, cell: stone.cell }
        : null;
      state.lastStoneMove[playerKey] = {
        from: fromPos,
        to: { ring: toRing, cell: toCell }
      };

      // Clear the stone from its previous cell (if it was on the board)
      if (stone.ring >= 0 && stone.ring < 5 && stone.cell >= 0) {
        const fromKey = `${stone.ring}-${stone.cell}`;
        state.cells[fromKey].stone = null;
      }

      // Moving to ring 5 means the stone has reached the center goal
      if (toRing === 5) {
        state.score[playerKey]++;

        // Mark the stone as scored (remove it from board tracking)
        const stoneArray = state.stones[playerKey];
        const stoneIndex = stoneArray.findIndex(s =>
          s.ring === stone.ring && s.cell === stone.cell
        );
        if (stoneIndex >= 0) {
          // ring: 99 / cell: 99 is a sentinel meaning "this stone has been scored"
          stoneArray[stoneIndex] = { ...stone, ring: 99, cell: 99 };
        }

        // Check win condition — first player to score all 3 stones wins
        if (state.score[playerKey] === 3) {
          state.gameWin = true;
          state.winner = stone.player;
        }

        state.displayMessage = `${playerKey === 'player1' ? state.player1Name : state.player2Name} scored! (${state.score[playerKey]}/3)`;
      } else {
        // Normal move — place stone at the new position on the board
        const toKey = `${toRing}-${toCell}`;
        state.cells[toKey].stone = { ...stone, ring: toRing, cell: toCell };

        // Update the stone's position in the player's stone array.
        // Match by current position, or by ring: -1 if it's being placed for the first time.
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

    /**
     * Selects an unplaced stone from the tray so it can be placed on the board.
     * Only works if the stone is actually unplaced (ring === -1).
     * The selected stone is stored in `selectedStone` and the UI shows placement targets.
     */
    selectUnplacedStone: (state, action: PayloadAction<{ player: 1 | 2; index: number }>) => {
      const { player, index } = action.payload;
      const stone = state.stones[`player${player}` as 'player1' | 'player2'][index];

      if (stone && stone.ring === -1) {
        state.selectedStone = stone;
        state.displayMessage = `Click a cell on the outermost ring to place your stone`;
      }
    },

    // ─── Coin use ──────────────────────────────────────────────────────────────

    /**
     * Selects a coin for use — marks it as the active coin without completing the action yet.
     *
     * The two-step flow (useCoin → completeCoinAction) allows the UI to show
     * a targeting state after a coin is chosen. For example, after selecting
     * Vertigo (spin ring), the user clicks which ring to spin — only then is
     * completeCoinAction dispatched to mark the coin as used.
     */
    useCoin: (state, action: PayloadAction<string>) => {
      state.selectedCoin = action.payload;
    },

    /**
     * Finalizes a coin use after the player has completed the required action.
     *
     * Records the coin in `coinsUsedThisRound` (it becomes disabled next round),
     * stores it in `lastCoinUsed` (for the Charlatan coin to copy),
     * sets `hasUsedCoin` to true (allowing the turn to end),
     * and clears `selectedCoin`.
     */
    completeCoinAction: (state) => {
      if (state.selectedCoin) {
        const player = `player${state.turn}` as 'player1' | 'player2';
        state.coinsUsedThisRound[player].push(state.selectedCoin);
        state.lastCoinUsed[player] = state.selectedCoin;
        state.hasUsedCoin = true;
        state.selectedCoin = null;
      }
    },

    /** Cancels a coin selection without using it. Clears `selectedCoin`. */
    cancelCoin: (state) => {
      state.selectedCoin = null;
    },

    // ─── Ring manipulation ─────────────────────────────────────────────────────

    /**
     * Rotates a ring by one step in the given direction (clockwise or counter-clockwise).
     *
     * The rotation amount in degrees is 360 / number_of_cells_in_ring (e.g. 11.25° for ring 0).
     * This is a visual-only change stored in `degrees[]` — it does not actually move stones
     * or walls; the board rendering uses degrees to position elements.
     *
     * Used by: Vertigo coin (player-initiated), AI thunk
     */
    spinRing: (state, action: PayloadAction<{ ring: number; direction: 'cw' | 'ccw' }>) => {
      const { ring, direction } = action.payload;
      const increment = 360 / RING_CELL_COUNTS[ring];
      const rotation = direction === 'cw' ? increment : -increment;
      state.degrees[ring] = (state.degrees[ring] + rotation) % 360;
    },

    /**
     * Snaps a ring back to 0° rotation.
     * Used by: Cadence coin
     */
    resetRing: (state, action: PayloadAction<number>) => {
      state.degrees[action.payload] = 0;
    },

    /**
     * Locks a ring to prevent it from being spun.
     * Used by: Anathema coin
     */
    lockRing: (state, action: PayloadAction<number>) => {
      state.lockedRings[action.payload] = true;
    },

    /**
     * Unlocks a previously locked ring, allowing it to be spun again.
     * Used by: Polyphony coin
     */
    unlockRing: (state, action: PayloadAction<number>) => {
      state.lockedRings[action.payload] = false;
    },

    // ─── Wall and bridge manipulation ──────────────────────────────────────────

    /**
     * Places a wall in a cell. Walls block stone movement through that cell.
     * Used by: Sovereign coin
     */
    placeWall: (state, action: PayloadAction<{ ring: number; cell: number }>) => {
      const { ring, cell } = action.payload;
      const cellKey = `${ring}-${cell}`;
      state.cells[cellKey].hasWall = true;
    },

    /**
     * Removes a wall from a cell.
     * Used by: Rubicon coin
     */
    removeWall: (state, action: PayloadAction<{ ring: number; cell: number }>) => {
      const key = `${action.payload.ring}-${action.payload.cell}`;
      state.cells[key].hasWall = false;
    },

    /**
     * Places a bridge in a cell. Bridges allow stones to move between non-adjacent rings.
     * Used by: Arcadia coin
     */
    placeBridge: (state, action: PayloadAction<{ ring: number; cell: number }>) => {
      const { ring, cell } = action.payload;
      const cellKey = `${ring}-${cell}`;
      state.cells[cellKey].hasBridge = true;
    },

    /**
     * Removes a bridge from a cell.
     * Used by: Gamma coin
     */
    removeBridge: (state, action: PayloadAction<{ ring: number; cell: number }>) => {
      const key = `${action.payload.ring}-${action.payload.cell}`;
      state.cells[key].hasBridge = false;
    },

    /**
     * Toggles a cell between wall and bridge (wall→bridge or bridge→wall).
     * Does nothing if the cell has neither.
     * Used by: Aura coin
     */
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

    /**
     * Returns the opponent's last moved stone to where it was before they moved it.
     *
     * Uses `lastStoneMove` to find the stone's previous position.
     * If the opponent's last move was their first placement (no "from" position),
     * the stone is returned to the unplaced tray (ring: -1, cell: -1).
     * Also clears the opponent's lastStoneMove so it can't be undone twice.
     *
     * Used by: Mnemonic coin
     */
    returnOpponentStone: (state) => {
      const opponent = state.turn === 1 ? 'player2' : 'player1';
      const lastMove = state.lastStoneMove[opponent];

      if (!lastMove || !lastMove.to) return;

      // Find the stone at its current (post-move) position
      const toKey = `${lastMove.to.ring}-${lastMove.to.cell}`;
      const stone = state.cells[toKey]?.stone;
      if (!stone) return;

      // Remove from current position
      state.cells[toKey].stone = null;

      if (lastMove.from) {
        // Stone was moved from somewhere on the board — put it back there
        const fromKey = `${lastMove.from.ring}-${lastMove.from.cell}`;
        state.cells[fromKey].stone = { ...stone, ring: lastMove.from.ring, cell: lastMove.from.cell };

        const stoneArray = state.stones[opponent];
        const stoneIndex = stoneArray.findIndex(s =>
          s.ring === lastMove.to!.ring && s.cell === lastMove.to!.cell
        );
        if (stoneIndex >= 0) {
          stoneArray[stoneIndex] = { ...stone, ring: lastMove.from.ring, cell: lastMove.from.cell };
        }
      } else {
        // Stone was newly placed from the tray — return it to unplaced state
        const stoneArray = state.stones[opponent];
        const stoneIndex = stoneArray.findIndex(s =>
          s.ring === lastMove.to!.ring && s.cell === lastMove.to!.cell
        );
        if (stoneIndex >= 0) {
          stoneArray[stoneIndex] = { ...stone, ring: -1, cell: -1 };
        }
      }

      // Clear the record so Mnemonic can't be used to undo the same move twice
      state.lastStoneMove[opponent] = null;
    },

    /**
     * Records which coin the Magna player chose to disable for both players next round.
     * The actual disabling happens at end-of-round in endTurn.
     * Used by: Magna coin
     */
    setMagnaDisabledCoin: (state, action: PayloadAction<string>) => {
      state.magnaDisabledCoin = action.payload;
    },

    /**
     * Moves a wall or bridge from one cell to an adjacent empty cell.
     * Both `from` and `to` must be valid cells; the caller is responsible for
     * validating adjacency before dispatching.
     * Used by: Spectrum coin
     */
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

    // ─── Turn management ───────────────────────────────────────────────────────

    /**
     * Ends the current player's turn and hands play to the other player.
     *
     * Requirements before this can proceed:
     *   - hasMovedStone must be true
     *   - hasUsedCoin must be true
     *
     * At end of round (when play returns to player 1):
     *   - coinsUsedThisRound becomes the new disabledCoins (1-round cooldown)
     *   - Any Magna-disabled coin is added to both players' disabled lists
     *   - coinsUsedThisRound is cleared for the new round
     *   - round counter increments
     *
     * Note: The AI turn (if player 2 is AI) is triggered from the component
     * watching for turn === 2, not from within this action.
     */
    endTurn: (state) => {
      if (!state.hasMovedStone || !state.hasUsedCoin) {
        state.displayMessage = 'You must move a stone AND use a coin before ending your turn';
        return;
      }

      // Swap the active player
      state.turn = state.turn === 1 ? 2 : 1;
      state.hasMovedStone = false;
      state.hasUsedCoin = false;
      state.selectedStone = null;
      state.selectedCoin = null;

      // When play returns to player 1, a full round has completed
      if (state.turn === 1) {
        state.round++;

        // Apply coin cooldowns:
        // Coins used this round become disabled for the upcoming round
        state.disabledCoins.player1 = [...state.coinsUsedThisRound.player1];
        state.disabledCoins.player2 = [...state.coinsUsedThisRound.player2];

        // Add Magna's chosen coin to both players' disabled lists
        if (state.magnaDisabledCoin) {
          if (!state.disabledCoins.player1.includes(state.magnaDisabledCoin)) {
            state.disabledCoins.player1.push(state.magnaDisabledCoin);
          }
          if (!state.disabledCoins.player2.includes(state.magnaDisabledCoin)) {
            state.disabledCoins.player2.push(state.magnaDisabledCoin);
          }
          state.magnaDisabledCoin = null;
        }

        // Clear usage tracking for the new round
        state.coinsUsedThisRound.player1 = [];
        state.coinsUsedThisRound.player2 = [];
      }

      state.displayMessage = state.turn === 1 ?
        `${state.player1Name}'s turn` :
        `${state.player2Name}'s turn`;
    },

    // ─── UI state ──────────────────────────────────────────────────────────────

    /** Updates the status message shown at the top of the game board. */
    setDisplayMessage: (state, action: PayloadAction<string>) => {
      state.displayMessage = action.payload;
    },

    /**
     * Sets (or clears) the currently selected stone.
     * When a stone is selected, the board highlights valid move targets.
     * Pass null to deselect.
     */
    selectStone: (state, action: PayloadAction<Stone | null>) => {
      state.selectedStone = action.payload;
    },

    /**
     * Toggles the AI "thinking" overlay.
     * When true, the board is disabled and a loading indicator shows.
     * Set to true at the start of the AI's turn and false after endTurn.
     */
    setAIThinking: (state, action: PayloadAction<boolean>) => {
      state.isAIThinking = action.payload;
    }
  }
});

// Wire up the AI thunk's action references to this slice's actions.
// This breaks the circular dependency: the thunk file can't import from this
// slice at module load time, so we pass the actions in after creation.
injectSliceActions(voragoSlice.actions);

// Named action exports (used by components and the AI thunk via dispatch)
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

// The AI turn thunk — dispatched by VoragoBoard.tsx when turn === 2 and isAI === true
export { executeAITurn };

export default voragoSlice.reducer;
