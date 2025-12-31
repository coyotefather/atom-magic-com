'use client';

import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import {
  useCoin,
  completeCoinAction,
  cancelCoin,
  spinRing,
  resetRing,
  lockRing,
  unlockRing,
  setDisplayMessage,
  transformWallBridge,
  returnOpponentStone,
  setMagnaDisabledCoin,
  moveWallBridge
} from '@/lib/slices/voragoSlice';
import { useState } from 'react';
import CoinSVG from './CoinSVGs';

const CoinSelector = () => {
  const dispatch = useAppDispatch();
  const {
    availableCoins,
    disabledCoins,
    turn,
    hasUsedCoin,
    selectedCoin,
    lockedRings,
    degrees,
    cells,
    stones,
    round,
    lastStoneMove,
    lastCoinUsed,
    magnaDisabledCoin,
    coinsUsedThisRound
  } = useAppSelector(state => state.vorago);
  const [showRingSelector, setShowRingSelector] = useState<string | null>(null);
  const [spinDirection, setSpinDirection] = useState<'cw' | 'ccw' | null>(null);
  const [showCoinSelector, setShowCoinSelector] = useState(false); // For Magna
  const [showSpectrumSelector, setShowSpectrumSelector] = useState<{ ring: number; cell: number } | null>(null); // For Spectrum - selected wall/bridge

  const playerDisabledCoins = disabledCoins[`player${turn}` as 'player1' | 'player2'];
  const opponent = turn === 1 ? 'player2' : 'player1';
  const currentPlayer = `player${turn}` as 'player1' | 'player2';

  // Compute which coins are inapplicable based on current game state
  const getInapplicableCoins = (): Set<string> => {
    const inapplicable = new Set<string>();

    // Check board state
    const hasWalls = Object.values(cells).some(cell => cell.hasWall);
    const hasBridges = Object.values(cells).some(cell => cell.hasBridge);
    const hasWallsOrBridges = hasWalls || hasBridges;
    const allRingsLocked = lockedRings.every(locked => locked);
    const anyRingLocked = lockedRings.some(locked => locked);
    const anyUnlockedRingRotated = degrees.some((deg, i) => !lockedRings[i] && deg !== 0);

    // Aura (transformWallBridge) - disabled if no walls or bridges exist
    if (!hasWallsOrBridges) {
      inapplicable.add('Aura');
    }

    // Mnemonic (returnOpponentStone) - disabled if:
    // 1. Opponent hasn't moved a stone yet
    // 2. Previous position is now occupied
    const opponentLastMove = lastStoneMove[opponent];
    if (!opponentLastMove || !opponentLastMove.to) {
      inapplicable.add('Mnemonic');
    } else if (opponentLastMove.from) {
      // Check if the "from" position is now occupied
      const fromKey = `${opponentLastMove.from.ring}-${opponentLastMove.from.cell}`;
      if (cells[fromKey]?.stone) {
        inapplicable.add('Mnemonic');
      }
    }
    // If from is null (was unplaced), we can always return to unplaced state

    // Cadence (resetRing) - disabled if no unlocked rings have been rotated
    if (!anyUnlockedRingRotated) {
      inapplicable.add('Cadence');
    }

    // Anathema (lockRing) - disabled if all rings are already locked
    if (allRingsLocked) {
      inapplicable.add('Anathema');
    }

    // Gamma (removeBridge) - disabled if no bridges exist
    if (!hasBridges) {
      inapplicable.add('Gamma');
    }

    // Rubicon (removeWall) - disabled if no walls exist
    if (!hasWalls) {
      inapplicable.add('Rubicon');
    }

    // Vertigo (spinRing) - disabled if all rings are locked
    if (allRingsLocked) {
      inapplicable.add('Vertigo');
    }

    // Polyphony (unlockRing) - disabled if no rings are locked
    if (!anyRingLocked) {
      inapplicable.add('Polyphony');
    }

    // Spectrum (moveWallBridge) - disabled if no walls or bridges exist
    if (!hasWallsOrBridges) {
      inapplicable.add('Spectrum');
    }

    // Charlatan (copyOpponentCoin) - disabled if:
    // 1. Round 1 (no opponent history)
    // 2. Opponent's last coin was Charlatan
    // 3. Opponent's last coin is disabled by Magna
    // 4. Opponent's last coin is one you used last round (your cooldown)
    const opponentLastCoin = lastCoinUsed[opponent];
    if (round === 1 || !opponentLastCoin) {
      inapplicable.add('Charlatan');
    } else if (opponentLastCoin === 'Charlatan') {
      inapplicable.add('Charlatan');
    } else if (magnaDisabledCoin === opponentLastCoin) {
      inapplicable.add('Charlatan');
    } else if (playerDisabledCoins.includes(opponentLastCoin)) {
      // Can't use Charlatan to replay a coin you used last round
      inapplicable.add('Charlatan');
    }

    return inapplicable;
  };

  const inapplicableCoins = getInapplicableCoins();

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
	  case 'transformWallBridge':
		// Aura: Click a wall or bridge on the board to transform it
		dispatch(setDisplayMessage('Click a wall or bridge on the board to transform it'));
		break;
	  case 'returnOpponentStone':
		// Mnemonic: Immediate action - return opponent's last stone
		dispatch(returnOpponentStone());
		dispatch(setDisplayMessage('Opponent\'s stone returned to previous position'));
		dispatch(completeCoinAction());
		break;
	  case 'disableCoin':
		// Magna: Show coin selector
		setShowCoinSelector(true);
		dispatch(setDisplayMessage('Choose a coin to disable for both players next round'));
		break;
	  case 'moveWallBridge':
		// Spectrum: Click a wall or bridge to select it, then click adjacent empty cell
		dispatch(setDisplayMessage('Click a wall or bridge to move'));
		break;
	  case 'copyOpponentCoin': {
		// Charlatan: Execute opponent's last coin action
		const opponentCoin = lastCoinUsed[opponent];
		if (opponentCoin) {
		  dispatch(setDisplayMessage(`Copying ${opponentCoin}...`));
		  // Find the coin's action and trigger it
		  const coinDef = availableCoins.find(c => c.title === opponentCoin);
		  if (coinDef) {
			// Handle the copied action - completeCoinAction will be called when the action finishes
			// Only complete immediately for actions that don't need additional input
			const immediateActions = ['returnOpponentStone'];
			if (immediateActions.includes(coinDef.action)) {
			  handleCopiedCoinAction(coinDef.action);
			  dispatch(completeCoinAction());
			} else {
			  // For actions needing input, don't complete yet - it will complete when user finishes
			  handleCopiedCoinAction(coinDef.action);
			}
		  }
		}
		break;
	  }
	  default:
		// Other immediate actions
		dispatch(setDisplayMessage('Coin effect applied'));
		dispatch(completeCoinAction());
	}
  };

  // Handle Charlatan's copied coin action
  // Note: completeCoinAction is called by the parent for immediate actions,
  // or by the selection handlers (ring selector, coin selector, board click) for actions needing input
  const handleCopiedCoinAction = (action: string) => {
	switch (action) {
	  case 'spinRing':
		setShowRingSelector('spin');
		dispatch(setDisplayMessage('(Charlatan) Choose a ring to spin'));
		break;
	  case 'resetRing':
		setShowRingSelector('reset');
		dispatch(setDisplayMessage('(Charlatan) Choose a ring to reset'));
		break;
	  case 'lockRing':
		setShowRingSelector('lock');
		dispatch(setDisplayMessage('(Charlatan) Choose a ring to lock'));
		break;
	  case 'unlockRing':
		setShowRingSelector('unlock');
		dispatch(setDisplayMessage('(Charlatan) Choose a ring to unlock'));
		break;
	  case 'placeWall':
	  case 'removeWall':
	  case 'placeBridge':
	  case 'removeBridge':
	  case 'transformWallBridge':
	  case 'moveWallBridge':
		dispatch(setDisplayMessage('(Charlatan) Click a cell on the board'));
		break;
	  case 'returnOpponentStone':
		// Immediate action - execute it (completeCoinAction called by parent)
		dispatch(returnOpponentStone());
		dispatch(setDisplayMessage('(Charlatan) Opponent\'s stone returned'));
		break;
	  case 'disableCoin':
		setShowCoinSelector(true);
		dispatch(setDisplayMessage('(Charlatan) Choose a coin to disable'));
		break;
	  default:
		// Unknown action - complete immediately
		dispatch(setDisplayMessage('Charlatan effect applied'));
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
		<div className="mb-6 p-4 bg-black text-white border-2 border-stone">
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

	  {/* Magna coin selector overlay */}
	  {showCoinSelector && (
		<div className="mb-6 p-4 bg-black text-white border-2 border-stone">
		  <h4 className="marcellus text-lg mb-3">Choose a coin to disable for both players next round:</h4>
		  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
			{availableCoins.map(coin => (
			  <button
				key={coin.title}
				onClick={() => {
				  dispatch(setMagnaDisabledCoin(coin.title));
				  dispatch(completeCoinAction());
				  setShowCoinSelector(false);
				  dispatch(setDisplayMessage(`${coin.title} will be disabled for both players next round`));
				}}
				className="p-2 bg-gold text-black rounded hover:bg-brightgold text-sm"
			  >
				{coin.title}
			  </button>
			))}
		  </div>
		  <button
			onClick={() => {
			  dispatch(cancelCoin());
			  setShowCoinSelector(false);
			}}
			className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
		  >
			Cancel
		  </button>
		</div>
	  )}

	  {/* Coin list - always visible, but hide when selecting ring or coin */}
	  {!showRingSelector && !showCoinSelector && (
		<div className="grid grid-cols-2 gap-2">
		{availableCoins.map(coin => {
		  const isDisabledFromLastRound = playerDisabledCoins.includes(coin.title);
		  const isInapplicable = inapplicableCoins.has(coin.title);
		  const isUsedThisTurn = hasUsedCoin;
		  const isSelected = selectedCoin === coin.title;
		  const isOtherSelected = selectedCoin && selectedCoin !== coin.title;
		  const isClickable = !isDisabledFromLastRound && !isInapplicable && !isUsedThisTurn && !isOtherSelected;

		  return (
			<button
			  key={coin.title}
			  onClick={() => isClickable && handleCoinClick(coin.title, coin.action)}
			  disabled={!isClickable}
			  className={`
				p-2 border-2 transition-all relative flex flex-col items-center gap-1 text-center
				${isDisabledFromLastRound || isInapplicable
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

			  {/* N/A badge for inapplicable coins (only show if not also on cooldown) */}
			  {isInapplicable && !isDisabledFromLastRound && (
				<div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gray-500 text-white rounded text-[8px] font-bold shadow-sm">
				  N/A
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
				<p className="text-[10px] text-gray-700 leading-tight mt-0.5">
				  {coin.title === 'Charlatan' && lastCoinUsed[opponent]
					? <>Will copy: <span className="font-bold text-blue-600">{lastCoinUsed[opponent]}</span></>
					: coin.description
				  }
				</p>
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