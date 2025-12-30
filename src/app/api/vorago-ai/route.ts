import { NextRequest, NextResponse } from 'next/server';

interface Stone {
  player: 1 | 2;
  ring: number;
  cell: number;
}

interface GameState {
  cells: Record<string, any>;
  stones: {
	player1: Stone[];
	player2: Stone[];
  };
  disabledCoins: {
	player1: string[];
	player2: string[];
  };
  availableCoins: Array<{
	title: string;
	action: string;
  }>;
  degrees: number[];
  lockedRings: boolean[];
  round: number;
  lastStoneMove: {
	player1: { from: { ring: number; cell: number } | null; to: { ring: number; cell: number } | null } | null;
	player2: { from: { ring: number; cell: number } | null; to: { ring: number; cell: number } | null } | null;
  };
  lastCoinUsed: {
	player1: string | null;
	player2: string | null;
  };
  magnaDisabledCoin: string | null;
}

export async function POST(request: NextRequest) {
  try {
	const { gameState, difficulty } = await request.json();

	console.log('🤖 AI Turn Started');
	console.log('Difficulty:', difficulty);
	console.log('AI Stones:', gameState.stones.player2);

	// Simple AI logic
	const aiMove = makeAIMove(gameState, difficulty);

	console.log('🎯 AI Move:', aiMove);

	return NextResponse.json(aiMove);
  } catch (error) {
	console.error('AI Error:', error);
	return NextResponse.json(
	  { error: 'AI failed to make a move' },
	  { status: 500 }
	);
  }
}

function makeAIMove(gameState: GameState, difficulty: string) {
  // 1. Move a stone (prioritize moving toward center)
  const stoneMove = chooseStoneMove(gameState);

  // 2. Use a coin (random available coin that isn't disabled)
  const coinAction = chooseCoinAction(gameState);

  return {
	stoneMove,
	coinAction
  };
}

function chooseStoneMove(gameState: GameState): any {
  const aiStones = gameState.stones.player2;

  // Find unplaced stones first
  const unplacedStones = aiStones.filter(s => s.ring === -1);
  if (unplacedStones.length > 0) {
	// Place on outermost ring (ring 0)
	const targetRing = 0;
	const targetCell = findEmptyCell(gameState, targetRing);

	if (targetCell !== -1) {
	  console.log('🔵 AI placing new stone on ring', targetRing, 'cell', targetCell);
	  return {
		stone: unplacedStones[0],
		toRing: targetRing,
		toCell: targetCell
	  };
	}
  }

  // Find placed stones and move them toward center
  const placedStones = aiStones.filter(s => s.ring >= 0);

  for (const stone of placedStones) {
	// Skip if already at center
	if (stone.ring === 4) continue;

	// Try to move inward (toward center)
	const targetRing = stone.ring + 1;
	const targetCell = findEmptyCell(gameState, targetRing);

	if (targetCell !== -1) {
	  console.log('🔵 AI moving stone from ring', stone.ring, 'to ring', targetRing);
	  return {
		stone: stone,
		toRing: targetRing,
		toCell: targetCell
	  };
	}
  }

  // If can't move inward, try moving within same ring
  for (const stone of placedStones) {
	if (stone.ring === 4) continue;

	const adjacentCell = (stone.cell + 1) % getRingSize(stone.ring);
	const cellKey = `${stone.ring}-${adjacentCell}`;

	if (!gameState.cells[cellKey]?.stone) {
	  console.log('🔵 AI moving stone within ring', stone.ring);
	  return {
		stone: stone,
		toRing: stone.ring,
		toCell: adjacentCell
	  };
	}
  }

  console.log('⚠️ AI could not find valid stone move');
  return null;
}

function getInapplicableCoins(gameState: GameState): Set<string> {
  const inapplicable = new Set<string>();

  // Check board state
  const hasWalls = Object.values(gameState.cells).some((cell: any) => cell.hasWall);
  const hasBridges = Object.values(gameState.cells).some((cell: any) => cell.hasBridge);
  const hasWallsOrBridges = hasWalls || hasBridges;
  const allRingsLocked = gameState.lockedRings.every(locked => locked);
  const anyRingLocked = gameState.lockedRings.some(locked => locked);
  const anyUnlockedRingRotated = gameState.degrees.some((deg, i) => !gameState.lockedRings[i] && deg !== 0);

  // Aura (transformWallBridge) - disabled if no walls or bridges exist
  if (!hasWallsOrBridges) {
    inapplicable.add('Aura');
  }

  // Mnemonic (returnOpponentStone) - disabled if:
  // 1. Opponent (player1) hasn't moved a stone yet
  // 2. Previous position is now occupied
  const opponentLastMove = gameState.lastStoneMove?.player1;
  if (!opponentLastMove || !opponentLastMove.to) {
    inapplicable.add('Mnemonic');
  } else if (opponentLastMove.from) {
    const fromKey = `${opponentLastMove.from.ring}-${opponentLastMove.from.cell}`;
    if (gameState.cells[fromKey]?.stone) {
      inapplicable.add('Mnemonic');
    }
  }

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
  // 4. Opponent's last coin is one AI used last round (AI's cooldown)
  const opponentLastCoin = gameState.lastCoinUsed?.player1;
  const aiDisabledCoins = gameState.disabledCoins?.player2 || [];
  if (gameState.round === 1 || !opponentLastCoin) {
    inapplicable.add('Charlatan');
  } else if (opponentLastCoin === 'Charlatan') {
    inapplicable.add('Charlatan');
  } else if (gameState.magnaDisabledCoin === opponentLastCoin) {
    inapplicable.add('Charlatan');
  } else if (aiDisabledCoins.includes(opponentLastCoin)) {
    inapplicable.add('Charlatan');
  }

  return inapplicable;
}

function chooseCoinAction(gameState: GameState): any {
  // Get inapplicable coins based on game state
  const inapplicableCoins = getInapplicableCoins(gameState);

  const availableCoins = gameState.availableCoins.filter(
	coin => !gameState.disabledCoins.player2.includes(coin.title) &&
			!inapplicableCoins.has(coin.title)
  );

  if (availableCoins.length === 0) {
	console.log('⚠️ No available coins for AI');
	return null;
  }

  // Pick a random available coin
  const coin = availableCoins[Math.floor(Math.random() * availableCoins.length)];

  console.log('🪙 AI using coin:', coin.title);

  // Handle different coin actions
  const coinAction: any = {
	coinTitle: coin.title,
	action: coin.action
  };

  // Add required parameters for specific actions
  switch (coin.action) {
	case 'spinRing': {
	  // Pick a random unlocked ring
	  const unlockedRings = gameState.degrees
		.map((_, idx) => idx)
		.filter(idx => !gameState.lockedRings[idx]);

	  if (unlockedRings.length > 0) {
		coinAction.ring = unlockedRings[Math.floor(Math.random() * unlockedRings.length)];
		coinAction.direction = Math.random() > 0.5 ? 'cw' : 'ccw';
	  }
	  break;
	}

	case 'resetRing': {
	  // Pick a ring that has been rotated
	  const rotatedRings = gameState.degrees
		.map((deg, idx) => ({ idx, deg }))
		.filter(r => r.deg !== 0 && !gameState.lockedRings[r.idx]);

	  if (rotatedRings.length > 0) {
		coinAction.ring = rotatedRings[Math.floor(Math.random() * rotatedRings.length)].idx;
	  }
	  break;
	}

	case 'lockRing': {
	  // Pick a random unlocked ring
	  const unlocked = gameState.lockedRings
		.map((locked, idx) => locked ? -1 : idx)
		.filter(idx => idx >= 0);
	  if (unlocked.length > 0) {
		coinAction.ring = unlocked[Math.floor(Math.random() * unlocked.length)];
	  }
	  break;
	}

	case 'unlockRing': {
	  // Pick a random locked ring
	  const locked = gameState.lockedRings
		.map((isLocked, idx) => isLocked ? idx : -1)
		.filter(idx => idx >= 0);
	  if (locked.length > 0) {
		coinAction.ring = locked[Math.floor(Math.random() * locked.length)];
	  }
	  break;
	}

	case 'placeWall':
	case 'placeBridge': {
	  // Pick a random empty cell
	  const emptyCells: { ring: number; cell: number }[] = [];
	  Object.values(gameState.cells).forEach((cell: any) => {
		if (!cell.hasWall && !cell.hasBridge && !cell.stone) {
		  emptyCells.push({ ring: cell.ring, cell: cell.cell });
		}
	  });
	  if (emptyCells.length > 0) {
		const target = emptyCells[Math.floor(Math.random() * emptyCells.length)];
		coinAction.ring = target.ring;
		coinAction.cell = target.cell;
	  }
	  break;
	}

	case 'removeWall': {
	  // Find a cell with a wall
	  const wallCells = Object.values(gameState.cells).filter((c: any) => c.hasWall);
	  if (wallCells.length > 0) {
		const target = wallCells[Math.floor(Math.random() * wallCells.length)] as any;
		coinAction.ring = target.ring;
		coinAction.cell = target.cell;
	  }
	  break;
	}

	case 'removeBridge': {
	  // Find a cell with a bridge
	  const bridgeCells = Object.values(gameState.cells).filter((c: any) => c.hasBridge);
	  if (bridgeCells.length > 0) {
		const target = bridgeCells[Math.floor(Math.random() * bridgeCells.length)] as any;
		coinAction.ring = target.ring;
		coinAction.cell = target.cell;
	  }
	  break;
	}

	case 'transformWallBridge': {
	  // Find a cell with a wall or bridge
	  const wallBridgeCells = Object.values(gameState.cells).filter((c: any) => c.hasWall || c.hasBridge);
	  if (wallBridgeCells.length > 0) {
		const target = wallBridgeCells[Math.floor(Math.random() * wallBridgeCells.length)] as any;
		coinAction.ring = target.ring;
		coinAction.cell = target.cell;
	  }
	  break;
	}

	case 'returnOpponentStone': {
	  // Immediate action - no parameters needed
	  break;
	}

	case 'disableCoin': {
	  // Pick a random coin to disable (exclude coins already on cooldown for simplicity)
	  const allCoins = gameState.availableCoins.map(c => c.title);
	  const randomCoin = allCoins[Math.floor(Math.random() * allCoins.length)];
	  coinAction.targetCoin = randomCoin;
	  break;
	}

	case 'moveWallBridge': {
	  // Find a wall or bridge and an adjacent empty cell
	  const wallBridgeCells = Object.values(gameState.cells).filter((c: any) => c.hasWall || c.hasBridge) as any[];
	  if (wallBridgeCells.length > 0) {
		const source = wallBridgeCells[Math.floor(Math.random() * wallBridgeCells.length)];
		coinAction.fromRing = source.ring;
		coinAction.fromCell = source.cell;
		// Find an adjacent empty cell (simplified - just pick same ring +1 cell)
		const destCell = (source.cell + 1) % getRingSize(source.ring);
		coinAction.toRing = source.ring;
		coinAction.toCell = destCell;
	  }
	  break;
	}

	case 'copyOpponentCoin': {
	  // Get opponent's last coin and copy its action
	  const opponentCoin = gameState.lastCoinUsed?.player1;
	  if (opponentCoin) {
		coinAction.copiedCoin = opponentCoin;
	  }
	  break;
	}
  }

  return coinAction;
}

function findEmptyCell(gameState: GameState, ring: number): number {
  const ringSize = getRingSize(ring);

  // Try each cell in the ring
  for (let cell = 0; cell < ringSize; cell++) {
	const cellKey = `${ring}-${cell}`;
	const cellData = gameState.cells[cellKey];

	// Check if cell exists, has no stone, and has no wall
	if (cellData && !cellData.stone && !cellData.hasWall) {
	  return cell;
	}
  }

  return -1; // No empty cell found
}

function getRingSize(ring: number): number {
  const sizes = [12, 10, 8, 6, 4]; // Ring sizes from outermost to innermost
  return sizes[ring] || 4;
}