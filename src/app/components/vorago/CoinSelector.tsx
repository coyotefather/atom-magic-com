'use client';

import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { useCoin, spinRing, resetRing, lockRing, unlockRing, setDisplayMessage } from '@/lib/slices/voragoSlice';
import { useState } from 'react';
import CoinSVG from './CoinSVGs';

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

  return (
	<div>
	  {/* Ring selector overlay - show this even if coin used */}
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

	  {/* Show "already used" message only when not selecting ring */}
	  {hasUsedCoin && !showRingSelector && (
		<div className="text-center text-gray-500 py-4">
		  You've already used a coin this turn
		</div>
	  )}

	  {/* Coin list - hide when selecting ring or after coin used */}
	  {!hasUsedCoin && !showRingSelector && (
		<div className="space-y-2">
		{availableCoins.map(coin => {
		  const isDisabled = playerDisabledCoins.includes(coin.title);

		  return (
			<button
			  key={coin.title}
			  onClick={() => !isDisabled && handleCoinClick(coin.title, coin.action)}
			  disabled={isDisabled}
			  className={`
				w-full p-2 border-2 rounded-lg transition-all relative flex items-center gap-3 text-left
				${isDisabled
				  ? 'opacity-50 cursor-not-allowed border-gray-400 bg-gray-100'
				  : 'border-black hover:shadow-md hover:scale-[1.01] cursor-pointer bg-white'
				}
			  `}
			>
			  {/* Coin SVG on left - small */}
			  <div className="flex-shrink-0">
				<div className={`w-12 h-12 transition-transform ${!isDisabled && 'hover:scale-110'}`}>
				  <CoinSVG aspect={coin.aspect} />
				</div>
			  </div>

			  {/* Coin info on right */}
			  <div className="flex-grow min-w-0">
				<h3 className="font-bold marcellus text-sm leading-tight mb-1">{coin.title}</h3>
				<p className="text-[11px] text-gray-700 leading-tight">{coin.description}</p>

				{isDisabled && (
				  <div className="mt-1 px-1.5 py-0.5 bg-red-100 border border-red-300 rounded text-[10px] text-red-700 font-semibold inline-block">
					🚫 Used Last Round
				  </div>
				)}
			  </div>
			</button>
		  );
		})}
	  </div>
	  )}
	</div>
  );
};

export default CoinSelector;