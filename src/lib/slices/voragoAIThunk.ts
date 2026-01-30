// Vorago AI turn execution thunk

import { createAsyncThunk } from '@reduxjs/toolkit';
import { selectRandomElement, randomDirection } from '../utils/random';
import type { VoragoState } from './voragoTypes';
import { RING_CELL_COUNTS } from './voragoConstants';

// Import actions - these will be set by the slice to avoid circular dependency
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

// Called by voragoSlice to inject actions and avoid circular dependency
export function injectSliceActions(actions: typeof sliceActions) {
  sliceActions = actions;
}

// Helper functions for AI coin actions
function getRandomUnlockedRing(lockedRings: boolean[]): number {
  const unlocked = lockedRings.map((locked, i) => locked ? -1 : i).filter(i => i >= 0);
  return selectRandomElement(unlocked) ?? 0;
}

function getRandomLockedRing(lockedRings: boolean[]): number | null {
  const locked = lockedRings.map((isLocked, i) => isLocked ? i : -1).filter(i => i >= 0);
  return selectRandomElement(locked) ?? null;
}

function getRandomEmptyCell(cells: VoragoState['cells']): { ring: number; cell: number } | null {
  const emptyCells: { ring: number; cell: number }[] = [];
  Object.values(cells).forEach(cell => {
	if (!cell.hasWall && !cell.hasBridge && !cell.stone) {
	  emptyCells.push({ ring: cell.ring, cell: cell.cell });
	}
  });
  return selectRandomElement(emptyCells) ?? null;
}

// AI move response types
interface AIMoveResponse {
  stoneMove?: {
	stone: { player: 1 | 2; ring: number; cell: number };
	toRing: number;
	toCell: number;
  };
  coinAction?: {
	coinTitle: string;
	action: string;
	ring?: number;
	cell?: number;
	direction?: 'cw' | 'ccw';
	targetCoin?: string;
	fromRing?: number;
	fromCell?: number;
  };
}

// Async thunk for AI turn
export const executeAITurn = createAsyncThunk(
  'vorago/executeAITurn',
  async (_, { getState, dispatch }) => {
	if (!sliceActions) {
	  throw new Error('Slice actions not injected - call injectSliceActions first');
	}

	const state = getState() as { vorago: VoragoState };
	const { isAI, aiDifficulty, turn } = state.vorago;

	if (!isAI || turn !== 2) {
	  return;
	}

	// Set AI thinking state
	dispatch(sliceActions.setAIThinking(true));
	dispatch(sliceActions.setDisplayMessage('AI is thinking...'));

	// Wait a bit for realism
	await new Promise(resolve => setTimeout(resolve, 1000));

	try {
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

	  // Execute the AI's stone move
	  if (aiMove.stoneMove) {
		dispatch(sliceActions.moveStone({
		  stone: aiMove.stoneMove.stone,
		  toRing: aiMove.stoneMove.toRing,
		  toCell: aiMove.stoneMove.toCell
		}));
	  }

	  // Wait a moment between actions
	  await new Promise(resolve => setTimeout(resolve, 500));

	  // Execute the AI's coin action
	  if (aiMove.coinAction) {
		dispatch(sliceActions.useCoin(aiMove.coinAction.coinTitle));

		// Wait a bit then handle coin-specific actions
		await new Promise(resolve => setTimeout(resolve, 300));

		// Get current state for fallback logic
		const currentState = (getState() as { vorago: VoragoState }).vorago;
		const { lockedRings, cells } = currentState;

		// Handle coin-specific actions with fallbacks
		executeCoinAction(dispatch, aiMove.coinAction, lockedRings, cells);
	  }

	  dispatch(sliceActions.setDisplayMessage('AI turn complete'));

	  // Wait a moment then end turn
	  await new Promise(resolve => setTimeout(resolve, 1000));

	  // End the AI's turn
	  dispatch(sliceActions.setAIThinking(false));
	  dispatch(sliceActions.endTurn());

	} catch (error) {
	  console.error('Vorago AI turn error:', error);
	  dispatch(sliceActions.setDisplayMessage('AI error - ending turn'));

	  await new Promise(resolve => setTimeout(resolve, 1500));

	  // End turn anyway to prevent getting stuck
	  dispatch(sliceActions.setAIThinking(false));
	  dispatch(sliceActions.endTurn());
	}
  }
);

// Execute the coin action based on AI response
function executeCoinAction(
  dispatch: (action: unknown) => void,
  coinAction: NonNullable<AIMoveResponse['coinAction']>,
  lockedRings: boolean[],
  cells: VoragoState['cells']
) {
  if (!sliceActions) return;

  switch (coinAction.action) {
	case 'spinRing': {
	  const ring = coinAction.ring ?? getRandomUnlockedRing(lockedRings);
	  const direction = coinAction.direction ?? randomDirection();
	  dispatch(sliceActions.spinRing({ ring, direction }));
	  dispatch(sliceActions.completeCoinAction());
	  break;
	}
	case 'resetRing': {
	  const ring = coinAction.ring ?? getRandomUnlockedRing(lockedRings);
	  dispatch(sliceActions.resetRing(ring));
	  dispatch(sliceActions.completeCoinAction());
	  break;
	}
	case 'lockRing': {
	  const ring = coinAction.ring ?? getRandomUnlockedRing(lockedRings);
	  dispatch(sliceActions.lockRing(ring));
	  dispatch(sliceActions.completeCoinAction());
	  break;
	}
	case 'unlockRing': {
	  const ring = coinAction.ring ?? getRandomLockedRing(lockedRings);
	  if (ring !== null) {
		dispatch(sliceActions.unlockRing(ring));
	  }
	  dispatch(sliceActions.completeCoinAction());
	  break;
	}
	case 'placeWall': {
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
	  dispatch(sliceActions.returnOpponentStone());
	  dispatch(sliceActions.completeCoinAction());
	  break;
	}
	case 'disableCoin': {
	  const targetCoin = coinAction.targetCoin ?? 'Vertigo';
	  dispatch(sliceActions.setMagnaDisabledCoin(targetCoin));
	  dispatch(sliceActions.completeCoinAction());
	  break;
	}
	case 'moveWallBridge': {
	  const wallBridgeCells = Object.values(cells).filter(c => c.hasWall || c.hasBridge);
	  if (wallBridgeCells.length > 0) {
		const source = (coinAction.fromRing !== undefined && coinAction.fromCell !== undefined)
		  ? { ring: coinAction.fromRing, cell: coinAction.fromCell }
		  : selectRandomElement(wallBridgeCells)!;
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
	  // Charlatan: Copy opponent's last coin (simplified - just complete)
	  dispatch(sliceActions.completeCoinAction());
	  break;
	}
	default:
	  dispatch(sliceActions.completeCoinAction());
  }
}
