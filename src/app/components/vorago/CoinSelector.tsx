'use client';

import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { useCoin, spinRing, resetRing, lockRing, unlockRing, setDisplayMessage } from '@/lib/slices/voragoSlice';
import { useState } from 'react';
import { motion } from 'framer-motion';

const CoinSelector = () => {
  const dispatch = useAppDispatch();
  const { availableCoins, disabledCoins, turn, hasUsedCoin, lockedRings } = useAppSelector(state => state.vorago);
  const [showRingSelector, setShowRingSelector] = useState<string | null>(null);
  const [spinDirection, setSpinDirection] = useState<'cw' | 'ccw' | null>(null);
  const [hoveredCoin, setHoveredCoin] = useState<string | null>(null);

  const playerDisabledCoins = disabledCoins[`player${turn}` as 'player1' | 'player2'];

  const handleCoinClick = (coinTitle: string, action: string) => {
	if (hasUsedCoin) return;

	dispatch(useCoin(coinTitle));

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

  const hoveredCoinData = hoveredCoin
	? availableCoins.find(c => c.title === hoveredCoin)
	: null;

  // Get color based on aspect - UPDATED COLORS
  const getCoinColor = (aspect: string) => {
	switch (aspect) {
	  case 'um':
		return { from: '#5b9bd5', to: '#2e5c8a' }; // Deeper blue
	  case 'os':
		return { from: '#e74c3c', to: '#a93226' }; // Deeper red
	  case 'umos':
		return { from: '#9b59b6', to: '#6c3483' }; // Deeper purple
	  default:
		return { from: '#f39c12', to: '#d68910' }; // Gold/amber
	}
  };

  if (hasUsedCoin) {
	return (
	  <div className="text-center text-gray-500 py-8">
		<p className="text-lg">You've already used a coin this turn</p>
	  </div>
	);
  }

  return (
	<div className="space-y-4">
	  {/* Coin description at top - COMPACT */}
	  {hoveredCoinData ? (
		<motion.div
		  initial={{ opacity: 0, y: -5 }}
		  animate={{ opacity: 1, y: 0 }}
		  className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-black rounded-lg min-h-[90px]"
		>
		  <h4 className="font-bold marcellus text-base mb-0.5">{hoveredCoinData.title}</h4>
		  <p className="text-[10px] italic text-gray-600 mb-1">{hoveredCoinData.subtitle}</p>
		  <p className="text-xs leading-relaxed">{hoveredCoinData.description}</p>
		</motion.div>
	  ) : (
		<div className="p-3 bg-gray-50 border-2 border-gray-300 rounded-lg min-h-[90px] flex items-center justify-center">
		  <p className="text-gray-400 text-xs italic">Hover over a coin to see its description</p>
		</div>
	  )}

	  {/* Ring selector overlay */}
	  {showRingSelector && (
		<div className="p-4 bg-black text-white rounded-lg">
		  <h4 className="marcellus text-base mb-3">
			{showRingSelector === 'spin' && !spinDirection && 'First, choose spin direction:'}
			{showRingSelector === 'spin' && spinDirection && 'Now choose which ring to spin:'}
			{showRingSelector === 'reset' && 'Choose which ring to reset:'}
			{showRingSelector === 'lock' && 'Choose which ring to lock:'}
			{showRingSelector === 'unlock' && 'Choose which ring to unlock:'}
		  </h4>

		  {showRingSelector === 'spin' && !spinDirection && (
			<div className="flex gap-3 justify-center mb-3">
			  <button
				onClick={() => setSpinDirection('cw')}
				className="bg-gold text-black px-4 py-2 rounded hover:bg-brightgold text-sm"
			  >
				↻ Clockwise
			  </button>
			  <button
				onClick={() => setSpinDirection('ccw')}
				className="bg-gold text-black px-4 py-2 rounded hover:bg-brightgold text-sm"
			  >
				↺ Counter-clockwise
			  </button>
			</div>
		  )}

		  {(showRingSelector !== 'spin' || spinDirection) && (
			<div className="flex gap-2 justify-center flex-wrap mb-3">
			  {[0, 1, 2, 3, 4].map(ringIndex => {
				const isLocked = lockedRings[ringIndex];
				const canSelect = showRingSelector === 'unlock' ? isLocked : !isLocked;

				return (
				  <button
					key={ringIndex}
					onClick={() => canSelect && handleRingSelection(ringIndex)}
					disabled={!canSelect}
					className={`
					  px-3 py-1 rounded border-2 text-sm
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
			className="w-full py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
		  >
			Cancel
		  </button>
		</div>
	  )}

	  {/* Two-column coin grid */}
	  {/* Two-column coin grid - SMALLER */}
	  <div className="grid grid-cols-2 gap-2">
		{availableCoins.map((coin, index) => {
		  const isDisabled = playerDisabledCoins.includes(coin.title);
		  const colors = getCoinColor(coin.aspect);

		  return (
			<motion.button
			  key={coin.title}
			  onClick={() => !isDisabled && handleCoinClick(coin.title, coin.action)}
			  onMouseEnter={() => setHoveredCoin(coin.title)}
			  onMouseLeave={() => setHoveredCoin(null)}
			  disabled={isDisabled}
			  initial={{ scale: 0, opacity: 0 }}
			  animate={{ scale: 1, opacity: 1 }}
			  transition={{ delay: index * 0.03 }}
			  whileHover={!isDisabled ? { scale: 1.08 } : {}}
			  className="relative"
			>
			  <div
				className={`
				  w-16 h-16
				  rounded-full border-3 border-black shadow-md
				  flex flex-col items-center justify-center
				  transition-all duration-200
				  ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
				  ${hoveredCoin === coin.title && !isDisabled ? 'ring-3 ring-gold ring-offset-1' : ''}
				`}
				style={{
				  background: `radial-gradient(circle at 30% 30%, ${colors.from}, ${colors.to})`,
				  boxShadow: isDisabled ? 'none' : '0 3px 8px rgba(0, 0, 0, 0.25)'
				}}
			  >
				<span className="font-bold text-[10px] text-center leading-tight px-1 text-white drop-shadow-md marcellus">
				  {coin.title}
				</span>

				{isDisabled && (
				  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-full">
					<span className="text-white text-[9px] font-bold">USED</span>
				  </div>
				)}
			  </div>
			</motion.button>
		  );
		})}
	  </div>
	</div>
  );
};

export default CoinSelector;