/**
 * GameStatus.tsx
 *
 * Compact status bar displayed at the top of the Vorago game UI. Shows the
 * current round number, whose turn it is, and the current score for both
 * players. Two checkmark indicators (Move / Coin) show at a glance which of
 * the two required actions the active player has completed this turn.
 *
 * Beyond rendering, this component drives two critical game-loop effects:
 *
 *   1. Auto-end turn — when both `hasMovedStone` and `hasUsedCoin` are true,
 *      the turn is automatically ended (with a 500 ms delay for visual
 *      feedback) by dispatching `endTurn`. A `turnEndedRef` guard prevents
 *      double-dispatch if the effect re-fires before the delay resolves.
 *
 *   2. AI turn trigger — when it is the AI player's turn (turn === 2 and
 *      isAI is true) and neither action has been taken yet, the component
 *      dispatches `executeAITurn` after a 500 ms delay so the AI's move
 *      appears to the human player as a brief thinking pause.
 *
 * Used by:
 *   - src/app/(website)/vorago/page.tsx (rendered in the game header bar)
 */

'use client';

import { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { executeAITurn, endTurn } from '@/lib/slices/voragoSlice';

const GameStatus = () => {
  const dispatch = useAppDispatch();
  const {
	round,
	turn,
	isAI,
	score,
	player1Name,
	player2Name,
	hasMovedStone,
	hasUsedCoin
  } = useAppSelector(state => state.vorago);

  // Track if we've already ended this turn (to prevent double-dispatch)
  const turnEndedRef = useRef(false);

  // Reset the ref when turn changes
  useEffect(() => {
	turnEndedRef.current = false;
  }, [turn]);

  // Auto-end turn when both actions are complete
  useEffect(() => {
	if (hasMovedStone && hasUsedCoin && !turnEndedRef.current) {
	  turnEndedRef.current = true;
	  // Small delay for visual feedback
	  const timer = setTimeout(() => {
		dispatch(endTurn());
	  }, 500);
	  return () => clearTimeout(timer);
	}
  }, [hasMovedStone, hasUsedCoin, dispatch]);

  // Trigger AI turn when it's AI's turn
  useEffect(() => {
	if (isAI && turn === 2 && !hasMovedStone && !hasUsedCoin) {
	  const timer = setTimeout(() => {
		dispatch(executeAITurn());
	  }, 500);
	  return () => clearTimeout(timer);
	}
  }, [isAI, turn, hasMovedStone, hasUsedCoin, dispatch]);

  const currentPlayerName = turn === 1 ? player1Name : player2Name;

  return (
	<div
	  className="bg-black text-white px-3 py-1.5 rounded flex items-center gap-4 text-sm h-full"
	  role="status"
	  aria-live="polite"
	  aria-label="Game status"
	>
	  {/* Round and Turn */}
	  <div className="flex items-center gap-2">
		<span className="marcellus" aria-label={`Round ${round}`}>R{round}</span>
		<span className="text-gold" aria-live="assertive">{currentPlayerName}&apos;s Turn</span>
	  </div>

	  {/* Score */}
	  <div className="flex items-center gap-2 text-xs" role="group" aria-label="Score">
		<span aria-label={`${player1Name} score: ${score.player1}`}>{player1Name}: {score.player1}</span>
		<span className="text-gray-500" aria-hidden="true">|</span>
		<span aria-label={`${player2Name} score: ${score.player2}`}>{player2Name}: {score.player2}</span>
	  </div>

	  {/* Action indicators */}
	  <div className="flex items-center gap-2 text-xs ml-auto" role="group" aria-label="Turn actions">
		<span
		  className={hasMovedStone ? 'text-green-400' : 'text-gray-500'}
		  aria-label={hasMovedStone ? 'Stone moved, complete' : 'Stone move required'}
		>
		  <span aria-hidden="true">{hasMovedStone ? '✓' : '○'}</span> Move
		</span>
		<span
		  className={hasUsedCoin ? 'text-green-400' : 'text-gray-500'}
		  aria-label={hasUsedCoin ? 'Coin used, complete' : 'Coin use required'}
		>
		  <span aria-hidden="true">{hasUsedCoin ? '✓' : '○'}</span> Coin
		</span>
	  </div>
	</div>
  );
};

export default GameStatus;