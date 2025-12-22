'use client';

import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { useCoin, spinRing, resetRing, lockRing, unlockRing, setDisplayMessage } from '@/lib/slices/voragoSlice';
import { useState } from 'react';

const CoinSelector = () => {
  const dispatch = useAppDispatch();
  const { availableCoins, disabledCoins, turn, hasUsedCoin, lockedRings } = useAppSelector(state => state.vorago);
  const [showRingSelector, setShowRingSelector] = useState<string | null>(null);
  const [spinDirection, setSpinDirection] = useState<'cw' | 'ccw' | null>(null);

  const playerDisabledCoins = disabledCoins[`player${turn}` as 'player1' | 'player2'];

  const handleCoinClick = (coinTitle: string, action: string) => {
	if (hasUsedCoin) return;

	dispatch(useCoin(coinTitle));

	// Handle coins that need additional input
	switch (action) {
	  case 'spinRing':
		setShowRingSelector('spin');
		dispatch(setDisplayMessage('Choose a ring to spin, then choose direction'));
		break;
	  case 'resetRing':
		setShowRingSelector('reset');
		dispatch(setDisplayMessage('Choose a ring to reset'));
		break;
	  case 'lockRing':
		setShowRingSelector('lock');
		dispatch(setDisplayMessage('Choose a ring to lock'));
		break;
	  case 'unlockRing':
		setShowRingSelector('unlock');
		dispatch(setDisplayMessage('Choose a ring to unlock'));
		break;
	  case 'placeWall':
	  case 'removeWall':
	  case 'placeBridge':
	  case 'removeBridge':
		dispatch(setDisplayMessage('Click a cell on the board'));
		break;
	  case 'freezeRound':
		dispatch(setDisplayMessage('Next round will be frozen (no stone movement allowed)'));
		break;
	  default:
		dispatch(setDisplayMessage('Coin effect applied'));
	}
  };

  const handleRingSelection = (ringIndex: number) => {
	if (!showRingSelector) return;

	switch (showRingSelector) {
	  case 'spin':
		if (spinDirection) {
		  dispatch(spinRing({ ring: ringIndex, direction: spinDirection }));
		  setShowRingSelector(null);
		  setSpinDirection(null);
		}
		break;
	  case 'reset':
		dispatch(resetRing(ringIndex));
		setShowRingSelector(null);
		break;
	  case 'lock':
		dispatch(lockRing(ringIndex));
		setShowRingSelector(null);
		break;
	  case 'unlock':
		dispatch(unlockRing(ringIndex));
		setShowRingSelector(null);
		break;
	}
  };

  if (hasUsedCoin) {
	return (
	  <div className="text-center text-gray-500 py-4">
		You've already used a coin this turn
	  </div>
	);
  }

  return (
	<div>
	  {/* Ring selector overlay */}
	  {showRingSelector && (
		<div className="mb-6 p-4 bg-black text-white rounded-lg">
		  <h4 className="marcellus text-lg mb-3">
			{showRingSelector === 'spin' && !spinDirection && 'First, choose spin direction:'}
			{showRingSelector === 'spin' && spinDirection && 'Now choose which ring to spin:'}
			{showRingSelector === 'reset' && 'Choose which ring to reset:'}
			{showRingSelector === 'lock' && 'Choose which ring to lock:'}
			{showRingSelector === 'unlock' && 'Choose which ring to unlock:'}
		  </h4>

		  {showRingSelector === 'spin' && !spinDirection && (
			<div className="flex gap-4 justify-center">
			  <button
				onClick={() => setSpinDirection('cw')}
				className="bg-gold text-black px-6 py-2 rounded hover:bg-brightgold"
			  >
				↻ Clockwise
			  </button>
			  <button
				onClick={() => setSpinDirection('ccw')}
				className="bg-gold text-black px-6 py-2 rounded hover:bg-brightgold"
			  >
				↺ Counter-clockwise
			  </button>
			</div>
		  )}

		  {(showRingSelector !== 'spin' || spinDirection) && (
			<div className="flex gap-2 justify-center flex-wrap">
			  {[0, 1, 2, 3, 4].map(ringIndex => {
				const isLocked = lockedRings[ringIndex];
				const canSelect = showRingSelector === 'unlock' ? isLocked : !isLocked;

				return (
				  <button
					key={ringIndex}
					onClick={() => canSelect && handleRingSelection(ringIndex)}
					disabled={!canSelect}
					className={`
					  px-4 py-2 rounded border-2
					  ${canSelect
						? 'bg-gold text-black border-black hover:bg-brightgold cursor-pointer'
						: 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
					  }
					`}
				  >
					Ring {ringIndex + 1}
					{isLocked && ' 🔒'}
				  </button>
				);
			  })}
			</div>
		  )}

		  <button
			onClick={() => {
			  setShowRingSelector(null);
			  setSpinDirection(null);
			}}
			className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
		  >
			Cancel
		  </button>
		</div>
	  )}

	  <div className="grid grid-cols-3 gap-4">
		{availableCoins.map(coin => {
		  const isDisabled = playerDisabledCoins.includes(coin.title);

		  return (
			<button
			  key={coin.title}
			  onClick={() => !isDisabled && handleCoinClick(coin.title, coin.action)}
			  disabled={isDisabled}
			  className={`
				relative
				aspect-square
				rounded-full
				border-4
				transition-all
				${isDisabled
				  ? 'opacity-30 cursor-not-allowed border-gray-400 bg-gray-200'
				  : 'cursor-pointer border-black hover:scale-110 shadow-lg'
				}
				${coin.aspect === 'um'
				  ? 'bg-gradient-to-br from-blue-200 to-blue-400'
				  : coin.aspect === 'os'
				  ? 'bg-gradient-to-br from-red-200 to-red-400'
				  : 'bg-gradient-to-br from-purple-200 to-purple-400'
				}
			  `}
			>
			  {/* Coin title in center */}
			  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
				<span className="font-bold marcellus text-sm md:text-base text-center">
				  {coin.title}
				</span>
			  </div>

			  {/* Disabled overlay */}
			  {isDisabled && (
				<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
				  <span className="text-white text-xs font-bold">USED</span>
				</div>
			  )}
			</button>
		  );
		})}
	  </div>
	</div>
  );
};

export default CoinSelector;