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
	<div className="bg-black text-white px-3 py-1.5 rounded flex items-center gap-4 text-sm h-full">
	  {/* Round and Turn */}
	  <div className="flex items-center gap-2">
		<span className="marcellus">R{round}</span>
		<span className="text-gold">{currentPlayerName}'s Turn</span>
	  </div>

	  {/* Score */}
	  <div className="flex items-center gap-2 text-xs">
		<span>{player1Name}: {score.player1}</span>
		<span className="text-gray-500">|</span>
		<span>{player2Name}: {score.player2}</span>
	  </div>

	  {/* Action indicators */}
	  <div className="flex items-center gap-2 text-xs ml-auto">
		<span className={hasMovedStone ? 'text-green-400' : 'text-gray-500'}>
		  {hasMovedStone ? '✓' : '○'} Move
		</span>
		<span className={hasUsedCoin ? 'text-green-400' : 'text-gray-500'}>
		  {hasUsedCoin ? '✓' : '○'} Coin
		</span>
	  </div>
	</div>
  );
};

export default GameStatus;