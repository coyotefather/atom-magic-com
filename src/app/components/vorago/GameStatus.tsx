'use client';

import { useEffect } from 'react';
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
	hasUsedCoin,
	displayMessage
  } = useAppSelector(state => state.vorago);

  // Trigger AI turn when it's AI's turn
	useEffect(() => {
	  if (isAI && turn === 2 && !hasMovedStone && !hasUsedCoin) {
		// Small delay to let UI update
		const timer = setTimeout(() => {
		  dispatch(executeAITurn());
		}, 500);

		return () => clearTimeout(timer);
	  }
	}, [isAI, turn, hasMovedStone, hasUsedCoin, dispatch]);

  const canEndTurn = hasMovedStone && hasUsedCoin;
  const currentPlayerName = turn === 1 ? player1Name : player2Name;

  return (
	<div className="bg-black text-white p-6 rounded-lg">
	  <div className="flex justify-between items-center mb-4">
		<div>
		  <h2 className="marcellus text-2xl">Round {round}</h2>
		  <p className="text-gold">{currentPlayerName}'s Turn</p>
		</div>

		<div className="text-right">
		  <p>{player1Name}: {score.player1}</p>
		  <p>{player2Name}: {score.player2}</p>
		</div>
	  </div>

	  <div className="mb-4">
		<p className="text-sm">{displayMessage}</p>
	  </div>

	  <div className="flex gap-4">
		<div className={hasMovedStone ? 'text-green-400' : 'text-gray-400'}>
		  ✓ Move Stone
		</div>
		<div className={hasUsedCoin ? 'text-green-400' : 'text-gray-400'}>
		  ✓ Use Coin
		</div>
	  </div>

	  <button
		onClick={() => dispatch(endTurn())}
		disabled={!canEndTurn}
		className={`
		  mt-4 w-full py-2 px-4 rounded
		  ${canEndTurn
			? 'bg-gold text-black hover:bg-brightgold cursor-pointer'
			: 'bg-gray-600 text-gray-400 cursor-not-allowed'
		  }
		`}
	  >
		End Turn
	  </button>
	</div>
  );
};

export default GameStatus;