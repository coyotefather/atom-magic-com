'use client';

import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { useCoin, completeCoinAction, cancelCoin, spinRing, resetRing, lockRing, unlockRing, setDisplayMessage } from '@/lib/slices/voragoSlice';
import { useState } from 'react';
import CoinSVG from './CoinSVGs';

const CoinSelector = () => {
  const dispatch = useAppDispatch();
  const { availableCoins, disabledCoins, turn, hasUsedCoin, selectedCoin, lockedRings } = useAppSelector(state => state.vorago);
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
		// These complete when user clicks a cell on the board
		dispatch(setDisplayMessage('Click a cell on the board'));
		break;
	  case 'freezeRound':
		// Immediate action - complete now
		dispatch(setDisplayMessage('Next round will be frozen (no stone movement allowed)'));
		dispatch(completeCoinAction());
		break;
	  default:
		// Other immediate actions
		dispatch(setDisplayMessage('Coin effect applied'));
		dispatch(completeCoinAction());
	}
  };

  const handleRingSelection = (ringIndex: number) => {
	if (!showRingSelector) return;

	switch (showRingSelector) {
	  case 'spin':
		if (spinDirection) {
		  dispatch(spinRing({ ring: ringIndex, direction: spinDirection }));
		  dispatch(completeCoinAction());
		  setShowRingSelector(null);
		  setSpinDirection(null);
		}
		break;
	  case 'reset':
		dispatch(resetRing(ringIndex));
		dispatch(completeCoinAction());
		setShowRingSelector(null);
		break;
	  case 'lock':
		dispatch(lockRing(ringIndex));
		dispatch(completeCoinAction());
		setShowRingSelector(null);
		break;
	  case 'unlock':
		dispatch(unlockRing(ringIndex));
		dispatch(completeCoinAction());
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
			  dispatch(cancelCoin());
			  setShowRingSelector(null);
			  setSpinDirection(null);
			}}
			className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
		  >
			Cancel
		  </button>
		</div>
	  )}

	  {/* Coin list - always visible, but hide when selecting ring */}
	  {!showRingSelector && (
		<div className="grid grid-cols-2 gap-2">
		{availableCoins.map(coin => {
		  const isDisabledFromLastRound = playerDisabledCoins.includes(coin.title);
		  const isUsedThisTurn = hasUsedCoin;
		  const isSelected = selectedCoin === coin.title;
		  const isOtherSelected = selectedCoin && selectedCoin !== coin.title;
		  const isClickable = !isDisabledFromLastRound && !isUsedThisTurn && !isOtherSelected;

		  return (
			<button
			  key={coin.title}
			  onClick={() => isClickable && handleCoinClick(coin.title, coin.action)}
			  disabled={!isClickable}
			  className={`
				p-2 border-2 rounded-lg transition-all relative flex flex-col items-center gap-1 text-center
				${isDisabledFromLastRound
				  ? 'opacity-50 cursor-not-allowed border-gray-400 bg-gray-100'
				  : isUsedThisTurn
					? 'opacity-70 cursor-not-allowed border-gray-300 bg-gray-50'
					: isSelected
					  ? 'border-gold bg-yellow-50 ring-2 ring-gold shadow-lg scale-[1.02]'
					  : isOtherSelected
						? 'opacity-40 cursor-not-allowed border-gray-300 bg-gray-50'
						: 'border-black hover:shadow-md hover:scale-[1.02] cursor-pointer bg-white'
				}
			  `}
			>
			  {/* Cooldown badge - absolutely positioned */}
			  {isDisabledFromLastRound && (
				<div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white rounded text-[8px] font-bold shadow-sm">
				  Cooldown
				</div>
			  )}

			  {/* Selected indicator */}
			  {isSelected && (
				<div className="absolute -top-1 -left-1 px-1.5 py-0.5 bg-gold text-black rounded text-[8px] font-bold shadow-sm">
				  Active
				</div>
			  )}

			  {/* Coin SVG */}
			  <div className={`w-10 h-10 transition-transform ${isClickable && 'hover:scale-110'}`}>
				<CoinSVG aspect={coin.aspect} />
			  </div>

			  {/* Coin info */}
			  <div className="w-full">
				<h3 className="font-bold marcellus text-xs leading-tight">{coin.title}</h3>
				<p className="text-[10px] text-gray-700 leading-tight mt-0.5">{coin.description}</p>
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