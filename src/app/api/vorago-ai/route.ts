export async function POST(request: Request) {
  const { gameState, difficulty } = await request.json();

  // For now, implement simple rule-based AI
  // Later can swap to Claude API for expert mode

  const move = getAIMove(gameState, difficulty);

  return Response.json({ move });
}

function getAIMove(gameState: any, difficulty: string) {
  // Simple AI logic
  // 1. Find closest stone to center
  // 2. Move it closer if possible
  // 3. Pick a random coin

  const aiStones = gameState.stones.player2;

  // Find stone furthest from center (highest ring number)
  const stoneToMove = aiStones.reduce((furthest: any, stone: any) => {
	return stone.ring > furthest.ring ? stone : furthest;
  }, aiStones[0]);

  // Try to move closer to center
  const targetRing = Math.max(0, stoneToMove.ring - 1);
  const targetCell = stoneToMove.cell; // Keep same cell for now

  // Pick random available coin
  const availableCoins = gameState.availableCoins.filter(
	(coin: any) => !gameState.disabledCoins.player2.includes(coin.title)
  );
  const randomCoin = availableCoins[Math.floor(Math.random() * availableCoins.length)];

  return {
	stoneToMove,
	stoneDestination: { ring: targetRing, cell: targetCell },
	coinToUse: randomCoin.title,
	reasoning: `Moving stone from ring ${stoneToMove.ring} closer to center`
  };
}